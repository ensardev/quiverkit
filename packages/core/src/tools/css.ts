export interface GradientStop {
  /** Any CSS colour string; this module never parses it. */
  color: string
  /** Position along the gradient, 0–100. */
  position: number
}

export type GradientKind = 'linear' | 'radial' | 'conic'

export interface Gradient {
  kind: GradientKind
  /** Degrees, used by linear and conic gradients. */
  angle: number
  stops: GradientStop[]
}

export function gradientToCss(gradient: Gradient): string {
  const stops = [...gradient.stops]
    .sort((left, right) => left.position - right.position)
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(', ')

  switch (gradient.kind) {
    case 'linear':
      return `linear-gradient(${gradient.angle}deg, ${stops})`
    case 'radial':
      return `radial-gradient(circle, ${stops})`
    case 'conic':
      return `conic-gradient(from ${gradient.angle}deg, ${stops})`
  }
}

export interface Shadow {
  offsetX: number
  offsetY: number
  blur: number
  spread: number
  color: string
  inset: boolean
}

export function shadowToCss(shadows: Shadow[]): string {
  if (shadows.length === 0) return 'none'

  return shadows
    .map((shadow) =>
      [
        shadow.inset ? 'inset' : '',
        `${shadow.offsetX}px`,
        `${shadow.offsetY}px`,
        `${shadow.blur}px`,
        `${shadow.spread}px`,
        shadow.color,
      ]
        .filter((part) => part !== '')
        .join(' '),
    )
    .join(', ')
}

/**
 * A stack of shadows with growing offset and blur reads as one soft shadow,
 * which is how design systems get depth that still looks like a single light
 * source. `alpha` fades with each layer so the stack does not turn muddy.
 */
export function elevation(level: number, hue = '0 0% 0%'): Shadow[] {
  const layers = Math.max(1, Math.min(level, 5))

  return Array.from({ length: layers }, (_, index) => {
    const step = index + 1
    return {
      offsetX: 0,
      offsetY: step * step,
      blur: step * step * 2,
      spread: -step,
      color: `hsl(${hue} / ${(0.12 / step).toFixed(3)})`,
      inset: false,
    }
  })
}
