function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

export function interpolateHex(from: string, to: string, t: number): string {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const rgb = a.map((channel, i) => lerp(channel, b[i], t));
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

export function skillBarColor(ratio: number): string {
  const t = Math.min(1, Math.max(0, ratio));
  if (t >= 0.5) {
    return interpolateHex('#f97316', '#16a34a', (t - 0.5) / 0.5);
  }
  return interpolateHex('#fde68a', '#f97316', t / 0.5);
}
