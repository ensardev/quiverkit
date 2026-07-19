export { err, ok, type Result, type ToolError } from './result.js'

export {
  decodeBase64,
  decodeBase64Url,
  encodeBase64,
  encodeBase64Url,
} from './tools/base64.js'

export {
  blend,
  checkContrast,
  contrastRatio,
  hsvToRgb,
  parseColor,
  relativeLuminance,
  toHex,
  toHsl,
  toHsv,
  toOklch,
  type ContrastVerdict,
  type Hsl,
  type Hsv,
  type Oklch,
  type Rgb,
} from './tools/color.js'

export { HASH_ALGORITHMS, hashText, hmac, type HashAlgorithm } from './tools/hash.js'

export {
  generatePassword,
  passwordEntropy,
  passwordStrength,
  type PasswordOptions,
  type PasswordStrength,
} from './tools/password.js'

export { formatJson, minifyJson, sortJsonKeys } from './tools/json.js'

export { claimAsDate, decodeJwt, type DecodedJwt } from './tools/jwt.js'

export {
  CASE_STYLES,
  convertCase,
  slugify,
  sortLines,
  splitWords,
  textStats,
  type CaseStyle,
  type SortOptions,
  type TextStats,
} from './tools/text.js'

export {
  describeTimestamp,
  parseTimestamp,
  type TimestampView,
} from './tools/timestamp.js'

export {
  decodeUrl,
  decodeUrlComponent,
  encodeUrl,
  encodeUrlComponent,
  parseUrl,
  type ParsedUrl,
} from './tools/url.js'

export { generateNanoId, generateUuidV4, generateUuidV7 } from './tools/uuid.js'
