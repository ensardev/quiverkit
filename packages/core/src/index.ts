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

export { decryptAes, encryptAes } from './tools/aes.js'

export {
  BEZIER_PRESETS,
  evaluate,
  sample,
  toCss,
  type BezierCurve,
} from './tools/bezier.js'

export { contains, parseCidr, type CidrInfo } from './tools/cidr.js'

export {
  elevation,
  gradientToCss,
  shadowToCss,
  type Gradient,
  type GradientKind,
  type GradientStop,
  type Shadow,
} from './tools/css.js'

export {
  convertUnits,
  CSS_UNITS,
  DEFAULT_CONTEXT,
  type CssUnit,
  type UnitContext,
  type UnitView,
} from './tools/cssUnits.js'

export {
  parseExif,
  stripExif,
  type ExifData,
  type ExifEntry,
  type GpsPosition,
} from './tools/exif.js'

export {
  CODE_TARGETS,
  generateCode,
  parseCurl,
  type CodeTarget,
  type Header,
  type HttpRequest,
} from './tools/curl.js'

export {
  generateKeyPair,
  KEY_ALGORITHMS,
  type KeyAlgorithm,
  type KeyPairPem,
} from './tools/keypair.js'

export {
  parseOctal,
  parseSymbolic,
  ROLES,
  toCommand,
  toOctal,
  toSymbolic,
  type PermissionSet,
  type Permissions,
  type Role,
} from './tools/chmod.js'

export {
  BINARY_UNITS,
  DECIMAL_UNITS,
  fromBytes,
  humanBytes,
  toBytes,
  type BinaryUnit,
  type DecimalUnit,
  type SizeUnit,
  type SizeView,
} from './tools/dataSize.js'

export {
  diffLines,
  type DiffLine,
  type DiffOperation,
  type DiffOptions,
  type DiffSummary,
} from './tools/diff.js'

export {
  ESCAPE_FLAVOURS,
  escapeText,
  unescapeText,
  type EscapeFlavour,
} from './tools/escape.js'

export { HASH_ALGORITHMS, hashBytes, hashText, hmac, type HashAlgorithm } from './tools/hash.js'

export {
  findInvisibles,
  stripInvisibles,
  type CleanOptions,
  type InvisibleCharacter,
  type InvisibleKind,
} from './tools/invisible.js'

export {
  COMMON_BASES,
  convertBase,
  formatInBase,
  MAX_BASE,
  MIN_BASE,
  parseInBase,
  toCommonBases,
  type BaseView,
} from './tools/numberBase.js'

export {
  highlightMatches,
  testRegex,
  type RegexGroup,
  type RegexHighlight,
  type RegexMatch,
} from './tools/regex.js'

export {
  compareSemver,
  parseSemver,
  satisfies,
  sortVersions,
  type SemVer,
} from './tools/semver.js'

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
