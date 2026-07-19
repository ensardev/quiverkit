export interface BezierCurve {
  x1: number
  y1: number
  x2: number
  y2: number
}

export const BEZIER_PRESETS: Record<string, BezierCurve> = {
  linear: { x1: 0, y1: 0, x2: 1, y2: 1 },
  ease: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
  easeIn: { x1: 0.42, y1: 0, x2: 1, y2: 1 },
  easeOut: { x1: 0, y1: 0, x2: 0.58, y2: 1 },
  easeInOut: { x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
  backOut: { x1: 0.34, y1: 1.56, x2: 0.64, y2: 1 },
}

/** One coordinate of a cubic Bézier whose first and last points are 0 and 1. */
function axis(t: number, a: number, b: number): number {
  const inverse = 1 - t
  return 3 * inverse * inverse * t * a + 3 * inverse * t * t * b + t * t * t
}

/**
 * CSS gives the curve as x(t) and y(t), but an animation needs y at a given x.
 * There is no closed form, so we search for the t that produces the requested x
 * and read y from it. Binary search is slower than Newton's method but cannot
 * diverge on the wild control points that `cubic-bezier(.34, 1.56, .64, 1)`
 * allows.
 */
export function evaluate(curve: BezierCurve, x: number): number {
  const target = Math.min(1, Math.max(0, x))
  if (target === 0 || target === 1) return target

  let low = 0
  let high = 1
  let t = target

  for (let step = 0; step < 40; step += 1) {
    const current = axis(t, curve.x1, curve.x2)
    if (Math.abs(current - target) < 1e-6) break

    if (current < target) low = t
    else high = t

    t = (low + high) / 2
  }

  return axis(t, curve.y1, curve.y2)
}

/** Points along the curve, ready to feed an SVG path. */
export function sample(curve: BezierCurve, steps = 60): { x: number; y: number }[] {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps
    return { x: axis(t, curve.x1, curve.x2), y: axis(t, curve.y1, curve.y2) }
  })
}

const trim = (value: number) => Number(value.toFixed(3)).toString()

export function toCss(curve: BezierCurve): string {
  return `cubic-bezier(${trim(curve.x1)}, ${trim(curve.y1)}, ${trim(curve.x2)}, ${trim(curve.y2)})`
}
