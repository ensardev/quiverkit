import jsQR from 'jsqr'
import QRCode from 'qrcode'
import { err, ok, type Result } from '../result.js'

/**
 * Generates a QR code as an SVG string.  The function is async because the
 * underlying encoder runs off the main thread to keep the page responsive.
 */
export async function generateQr(input: string): Promise<Result<string>> {
  const trimmed = input.trim()
  if (trimmed === '') return err('error.emptyInput')

  const svg = await QRCode.toString(trimmed, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
  })

  return ok(svg)
}

/**
 * Reads a QR code from raw pixel data.  The caller is responsible for getting
 * the image into that form — typically the web UI draws it onto a hidden canvas
 * and extracts the ImageData, which keeps core free of DOM concerns even though
 * the type itself comes from the browser.
 */
export async function readQr(imageData: ImageData): Promise<Result<string>> {
  if (imageData.width === 0 || imageData.height === 0) return err('error.emptyInput')

  const decoded = jsQR(imageData.data, imageData.width, imageData.height)
  if (!decoded) return err('error.noQrFound')

  return ok(decoded.data)
}
