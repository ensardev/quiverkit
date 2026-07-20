export type DiffOperation = 'equal' | 'insert' | 'delete'

export interface DiffLine {
  operation: DiffOperation
  value: string
  /** 1-based line number on each side, absent where the line does not exist. */
  left: number | undefined
  right: number | undefined
}

export interface DiffSummary {
  lines: DiffLine[]
  added: number
  removed: number
  unchanged: number
}

export interface DiffOptions {
  ignoreCase: boolean
  ignoreWhitespace: boolean
}

/**
 * The comparison key is separate from the stored text: with "ignore whitespace"
 * on, two lines can count as equal while still being displayed exactly as they
 * were typed.
 */
function keyOf(line: string, options: DiffOptions): string {
  let key = line
  if (options.ignoreWhitespace) key = key.trim().replaceAll(/\s+/g, ' ')
  if (options.ignoreCase) key = key.toLowerCase()
  return key
}

/**
 * Longest common subsequence, the classic diff core. The table is O(n×m), which
 * is fine for the files people paste into a browser; the common prefix and
 * suffix are stripped first so identical documents cost almost nothing.
 */
function lcsTable(left: string[], right: string[]): number[][] {
  const table: number[][] = Array.from({ length: left.length + 1 }, () =>
    new Array<number>(right.length + 1).fill(0),
  )

  for (let row = left.length - 1; row >= 0; row -= 1) {
    for (let column = right.length - 1; column >= 0; column -= 1) {
      const current = table[row] as number[]
      const below = table[row + 1] as number[]

      current[column] =
        left[row] === right[column]
          ? (below[column + 1] as number) + 1
          : Math.max(below[column] as number, current[column + 1] as number)
    }
  }

  return table
}

export interface WordChange {
  value: string
  operation: DiffOperation
}

/**
 * Compares two lines word by word so a changed line shows what actually moved
 * rather than lighting up whole. Splitting keeps the separators as their own
 * tokens, otherwise rebuilding the line would lose its spacing.
 */
export function diffWords(left: string, right: string): WordChange[] {
  const split = (text: string) => text.split(/(\s+)/).filter((part) => part !== '')
  const leftWords = split(left)
  const rightWords = split(right)
  const table = lcsTable(leftWords, rightWords)

  const changes: WordChange[] = []
  let row = 0
  let column = 0

  const push = (value: string, operation: DiffOperation) => {
    const last = changes[changes.length - 1]
    if (last && last.operation === operation) last.value += value
    else changes.push({ value, operation })
  }

  while (row < leftWords.length && column < rightWords.length) {
    if (leftWords[row] === rightWords[column]) {
      push(leftWords[row] as string, 'equal')
      row += 1
      column += 1
      continue
    }

    const down = (table[row + 1] as number[])[column] as number
    const across = (table[row] as number[])[column + 1] as number

    if (down >= across) {
      push(leftWords[row] as string, 'delete')
      row += 1
    } else {
      push(rightWords[column] as string, 'insert')
      column += 1
    }
  }

  while (row < leftWords.length) push(leftWords[row++] as string, 'delete')
  while (column < rightWords.length) push(rightWords[column++] as string, 'insert')

  return changes
}

export function diffLines(
  leftText: string,
  rightText: string,
  options: DiffOptions = { ignoreCase: false, ignoreWhitespace: false },
): DiffSummary {
  const leftLines = leftText.split(/\r?\n/)
  const rightLines = rightText.split(/\r?\n/)
  const leftKeys = leftLines.map((line) => keyOf(line, options))
  const rightKeys = rightLines.map((line) => keyOf(line, options))

  const lines: DiffLine[] = []
  let start = 0
  while (start < leftKeys.length && start < rightKeys.length && leftKeys[start] === rightKeys[start]) {
    lines.push({
      operation: 'equal',
      value: leftLines[start] as string,
      left: start + 1,
      right: start + 1,
    })
    start += 1
  }

  let leftEnd = leftKeys.length
  let rightEnd = rightKeys.length
  while (leftEnd > start && rightEnd > start && leftKeys[leftEnd - 1] === rightKeys[rightEnd - 1]) {
    leftEnd -= 1
    rightEnd -= 1
  }

  const middleLeft = leftKeys.slice(start, leftEnd)
  const middleRight = rightKeys.slice(start, rightEnd)
  const table = lcsTable(middleLeft, middleRight)

  let row = 0
  let column = 0
  let leftNumber = start + 1
  let rightNumber = start + 1

  while (row < middleLeft.length && column < middleRight.length) {
    if (middleLeft[row] === middleRight[column]) {
      lines.push({
        operation: 'equal',
        value: leftLines[leftNumber - 1] as string,
        left: leftNumber,
        right: rightNumber,
      })
      row += 1
      column += 1
      leftNumber += 1
      rightNumber += 1
      continue
    }

    const down = (table[row + 1] as number[])[column] as number
    const across = (table[row] as number[])[column + 1] as number

    if (down >= across) {
      lines.push({
        operation: 'delete',
        value: leftLines[leftNumber - 1] as string,
        left: leftNumber,
        right: undefined,
      })
      row += 1
      leftNumber += 1
    } else {
      lines.push({
        operation: 'insert',
        value: rightLines[rightNumber - 1] as string,
        left: undefined,
        right: rightNumber,
      })
      column += 1
      rightNumber += 1
    }
  }

  while (row < middleLeft.length) {
    lines.push({
      operation: 'delete',
      value: leftLines[leftNumber - 1] as string,
      left: leftNumber,
      right: undefined,
    })
    row += 1
    leftNumber += 1
  }

  while (column < middleRight.length) {
    lines.push({
      operation: 'insert',
      value: rightLines[rightNumber - 1] as string,
      left: undefined,
      right: rightNumber,
    })
    column += 1
    rightNumber += 1
  }

  for (let index = leftEnd; index < leftLines.length; index += 1) {
    lines.push({
      operation: 'equal',
      value: leftLines[index] as string,
      left: index + 1,
      right: rightEnd + (index - leftEnd) + 1,
    })
  }

  return {
    lines,
    added: lines.filter((line) => line.operation === 'insert').length,
    removed: lines.filter((line) => line.operation === 'delete').length,
    unchanged: lines.filter((line) => line.operation === 'equal').length,
  }
}
