import { err, ok, type Result } from '../result.js'

export interface ExifEntry {
  name: string
  value: string
}

export interface GpsPosition {
  latitude: number
  longitude: number
}

export interface ExifData {
  entries: ExifEntry[]
  /** Present only when the camera recorded a location — the privacy problem. */
  gps: GpsPosition | null
}

const TAGS: Record<number, string> = {
  0x010f: 'Make',
  0x0110: 'Model',
  0x0112: 'Orientation',
  0x0131: 'Software',
  0x0132: 'DateTime',
  0x829a: 'ExposureTime',
  0x829d: 'FNumber',
  0x8827: 'ISO',
  0x9003: 'DateTimeOriginal',
  0x920a: 'FocalLength',
  0xa002: 'PixelXDimension',
  0xa003: 'PixelYDimension',
  0xa430: 'OwnerName',
  0xa431: 'SerialNumber',
  0xa433: 'LensMake',
  0xa434: 'LensModel',
}

const GPS_TAGS: Record<number, string> = {
  0x0001: 'GPSLatitudeRef',
  0x0002: 'GPSLatitude',
  0x0003: 'GPSLongitudeRef',
  0x0004: 'GPSLongitude',
  0x0006: 'GPSAltitude',
}

const EXIF_POINTER = 0x8769
const GPS_POINTER = 0x8825

/** Byte length of each TIFF field type, indexed by the type code. */
const TYPE_SIZES: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 }

interface Field {
  tag: number
  type: number
  count: number
  offset: number
}

function readFields(view: DataView, start: number, little: boolean, tiffStart: number): Field[] {
  const count = view.getUint16(start, little)
  const fields: Field[] = []

  for (let index = 0; index < count; index += 1) {
    const entry = start + 2 + index * 12
    if (entry + 12 > view.byteLength) break

    const type = view.getUint16(entry + 2, little)
    const length = view.getUint32(entry + 4, little)
    const size = (TYPE_SIZES[type] ?? 1) * length

    fields.push({
      tag: view.getUint16(entry, little),
      type,
      count: length,
      // Values of four bytes or fewer sit inline; anything larger is a pointer
      // relative to the start of the TIFF block, not the file.
      offset: size <= 4 ? entry + 8 : tiffStart + view.getUint32(entry + 8, little),
    })
  }

  return fields
}

function readValue(view: DataView, field: Field, little: boolean): string | number | number[] {
  const { type, count, offset } = field

  if (type === 2) {
    let text = ''
    for (let index = 0; index < count; index += 1) {
      const code = view.getUint8(offset + index)
      if (code === 0) break
      text += String.fromCharCode(code)
    }
    return text.trim()
  }

  const numbers: number[] = []
  for (let index = 0; index < count; index += 1) {
    switch (type) {
      case 1:
      case 7:
        numbers.push(view.getUint8(offset + index))
        break
      case 3:
        numbers.push(view.getUint16(offset + index * 2, little))
        break
      case 4:
        numbers.push(view.getUint32(offset + index * 4, little))
        break
      case 5: {
        const denominator = view.getUint32(offset + index * 8 + 4, little)
        numbers.push(denominator === 0 ? 0 : view.getUint32(offset + index * 8, little) / denominator)
        break
      }
      case 9:
        numbers.push(view.getInt32(offset + index * 4, little))
        break
      case 10: {
        const denominator = view.getInt32(offset + index * 8 + 4, little)
        numbers.push(denominator === 0 ? 0 : view.getInt32(offset + index * 8, little) / denominator)
        break
      }
      default:
        break
    }
  }

  return numbers.length === 1 ? (numbers[0] as number) : numbers
}

/** GPS is stored as degrees, minutes and seconds; decimal is what maps want. */
function toDecimal(parts: number[], reference: string): number | null {
  const [degrees = 0, minutes = 0, seconds = 0] = parts
  if (parts.length < 2) return null

  const value = degrees + minutes / 60 + seconds / 3600
  return reference === 'S' || reference === 'W' ? -value : value
}

function findExifSegment(view: DataView): number | null {
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null

  let cursor = 2
  while (cursor + 4 < view.byteLength) {
    if (view.getUint8(cursor) !== 0xff) return null

    const marker = view.getUint8(cursor + 1)
    const length = view.getUint16(cursor + 2)

    if (marker === 0xe1 && cursor + 10 < view.byteLength) {
      let header = ''
      for (let index = 0; index < 4; index += 1) header += String.fromCharCode(view.getUint8(cursor + 4 + index))
      if (header === 'Exif') return cursor + 10
    }

    // Start of scan: image data begins, no metadata past this point.
    if (marker === 0xda) return null
    cursor += 2 + length
  }

  return null
}

export function parseExif(buffer: ArrayBuffer): Result<ExifData> {
  const view = new DataView(buffer)
  if (view.byteLength < 4) return err('error.emptyInput')
  if (view.getUint16(0) !== 0xffd8) return err('error.unsupportedImage')

  const tiffStart = findExifSegment(view)
  if (tiffStart === null) return ok({ entries: [], gps: null })

  const order = view.getUint16(tiffStart)
  const little = order === 0x4949
  if (!little && order !== 0x4d4d) return err('error.unsupportedImage')

  const entries: ExifEntry[] = []
  let gps: GpsPosition | null = null

  const collect = (start: number, names: Record<number, string>) => {
    for (const field of readFields(view, start, little, tiffStart)) {
      if (field.tag === EXIF_POINTER || field.tag === GPS_POINTER) continue

      const name = names[field.tag]
      if (!name) continue

      const value = readValue(view, field, little)
      entries.push({ name, value: Array.isArray(value) ? value.join(', ') : String(value) })
    }
  }

  const firstIfd = tiffStart + view.getUint32(tiffStart + 4, little)
  const rootFields = readFields(view, firstIfd, little, tiffStart)
  collect(firstIfd, TAGS)

  for (const field of rootFields) {
    if (field.tag === EXIF_POINTER) {
      collect(tiffStart + (readValue(view, field, little) as number), TAGS)
    }

    if (field.tag === GPS_POINTER) {
      const gpsStart = tiffStart + (readValue(view, field, little) as number)
      const values = new Map<string, string | number | number[]>()

      for (const gpsField of readFields(view, gpsStart, little, tiffStart)) {
        const name = GPS_TAGS[gpsField.tag]
        if (name) values.set(name, readValue(view, gpsField, little))
      }

      const latitude = values.get('GPSLatitude')
      const longitude = values.get('GPSLongitude')

      if (Array.isArray(latitude) && Array.isArray(longitude)) {
        const north = toDecimal(latitude, String(values.get('GPSLatitudeRef') ?? 'N'))
        const east = toDecimal(longitude, String(values.get('GPSLongitudeRef') ?? 'E'))
        if (north !== null && east !== null) gps = { latitude: north, longitude: east }
      }
    }
  }

  return ok({ entries, gps })
}

/**
 * Rebuilds the file without its metadata segments. The image data itself is
 * copied byte for byte, so nothing is re-encoded and no quality is lost.
 */
export function stripExif(buffer: ArrayBuffer): Result<ArrayBuffer> {
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return err('error.unsupportedImage')

  const keep: Uint8Array[] = [bytes.slice(0, 2)]
  let cursor = 2

  while (cursor + 4 < view.byteLength) {
    if (view.getUint8(cursor) !== 0xff) break

    const marker = view.getUint8(cursor + 1)

    if (marker === 0xda) {
      keep.push(bytes.slice(cursor))
      break
    }

    const length = view.getUint16(cursor + 2)
    // APP1 through APP15 carry Exif, XMP and IPTC; APP0 is the harmless JFIF
    // header that some decoders still expect to find.
    const isMetadata = marker >= 0xe1 && marker <= 0xef
    if (!isMetadata) keep.push(bytes.slice(cursor, cursor + 2 + length))

    cursor += 2 + length
  }

  const total = keep.reduce((sum, chunk) => sum + chunk.length, 0)
  const output = new Uint8Array(total)
  let position = 0
  for (const chunk of keep) {
    output.set(chunk, position)
    position += chunk.length
  }

  return ok(output.buffer)
}
