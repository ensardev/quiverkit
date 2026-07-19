import { describe, expect, it } from 'vitest'
import { parseExif, stripExif } from './exif.js'

/**
 * Builds the smallest JPEG that still carries a real Exif block: a TIFF header,
 * an IFD with two ASCII tags and a pointer to a GPS IFD holding a position of
 * 41°N 29°E. Hand-assembling it is the only way to test the parser without
 * committing a binary fixture.
 */
function jpegWithExif(): ArrayBuffer {
  const tiff = new Uint8Array(176)
  const view = new DataView(tiff.buffer)
  const ascii = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index += 1) view.setUint8(offset + index, text.charCodeAt(index))
  }
  const field = (at: number, tag: number, type: number, count: number, value: number) => {
    view.setUint16(at, tag, true)
    view.setUint16(at + 2, type, true)
    view.setUint32(at + 4, count, true)
    view.setUint32(at + 8, value, true)
  }
  const rational = (at: number, numerator: number, denominator: number) => {
    view.setUint32(at, numerator, true)
    view.setUint32(at + 4, denominator, true)
  }

  ascii(0, 'II')
  view.setUint16(2, 0x2a, true)
  view.setUint32(4, 8, true)

  view.setUint16(8, 3, true)
  field(10, 0x010f, 2, 8, 50)
  field(22, 0x0110, 2, 5, 58)
  field(34, 0x8825, 4, 1, 64)
  view.setUint32(46, 0, true)
  ascii(50, 'TestCam\0')
  ascii(58, 'QK-1\0')

  view.setUint16(64, 4, true)
  field(66, 0x0001, 2, 2, 0)
  ascii(74, 'N\0')
  field(78, 0x0002, 5, 3, 128)
  field(90, 0x0003, 2, 2, 0)
  ascii(98, 'E\0')
  field(102, 0x0004, 5, 3, 152)
  view.setUint32(114, 0, true)

  rational(128, 41, 1)
  rational(136, 0, 1)
  rational(144, 0, 1)
  rational(152, 29, 1)
  rational(160, 0, 1)
  rational(168, 0, 1)

  const header = new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0x00, 0xb8, 0x45, 0x78, 0x69, 0x66, 0, 0])
  const trailer = new Uint8Array([0xff, 0xda, 0x00, 0x04, 0x00, 0x00, 0xff, 0xd9])

  const file = new Uint8Array(header.length + tiff.length + trailer.length)
  file.set(header, 0)
  file.set(tiff, header.length)
  file.set(trailer, header.length + tiff.length)

  return file.buffer
}

describe('parseExif', () => {
  it('reads the camera tags', () => {
    const result = parseExif(jpegWithExif())
    if (!result.ok) throw new Error(`expected parsing to succeed, got ${result.error}`)

    expect(result.value.entries).toEqual(
      expect.arrayContaining([
        { name: 'Make', value: 'TestCam' },
        { name: 'Model', value: 'QK-1' },
      ]),
    )
  })

  it('turns degrees, minutes and seconds into a decimal position', () => {
    const result = parseExif(jpegWithExif())
    if (!result.ok) throw new Error('expected parsing to succeed')

    expect(result.value.gps).toEqual({ latitude: 41, longitude: 29 })
  })

  it('reports no metadata rather than failing on a clean jpeg', () => {
    const clean = new Uint8Array([0xff, 0xd8, 0xff, 0xda, 0x00, 0x04, 0x00, 0x00, 0xff, 0xd9])
    expect(parseExif(clean.buffer)).toEqual({ ok: true, value: { entries: [], gps: null } })
  })

  it('rejects anything that is not a jpeg', () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0])
    expect(parseExif(png.buffer)).toEqual({ ok: false, error: 'error.unsupportedImage' })
  })
})

describe('stripExif', () => {
  it('removes the metadata and leaves nothing to read', () => {
    const stripped = stripExif(jpegWithExif())
    if (!stripped.ok) throw new Error('expected stripping to succeed')

    expect(parseExif(stripped.value)).toEqual({ ok: true, value: { entries: [], gps: null } })
  })

  it('produces a smaller file that is still a jpeg', () => {
    const original = jpegWithExif()
    const stripped = stripExif(original)
    if (!stripped.ok) throw new Error('expected stripping to succeed')

    expect(stripped.value.byteLength).toBeLessThan(original.byteLength)
    expect(new DataView(stripped.value).getUint16(0)).toBe(0xffd8)
  })

  it('keeps the image data byte for byte', () => {
    const stripped = stripExif(jpegWithExif())
    if (!stripped.ok) throw new Error('expected stripping to succeed')

    const bytes = new Uint8Array(stripped.value)
    // The scan segment and end marker survive untouched; only metadata went.
    expect([...bytes.slice(-8)]).toEqual([0xff, 0xda, 0x00, 0x04, 0x00, 0x00, 0xff, 0xd9])
  })
})
