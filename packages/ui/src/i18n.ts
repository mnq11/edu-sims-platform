/** اتجاه الواجهة — المنصة عربية أولاً، وكل مكون يقرأ اتجاهه من هنا. */
export type Direction = 'rtl' | 'ltr';

let direction: Direction = 'rtl';

export function setDirection(next: Direction): void {
  direction = next;
  document.documentElement.dir = next;
  document.documentElement.lang = next === 'rtl' ? 'ar' : 'en';
}

export function getDirection(): Direction {
  return direction;
}

/** يحوّل نسبة تقدم (0..1) إلى إزاحة أفقية تراعي الاتجاه. */
export function progressToOffset(progress: number, trackWidth: number): number {
  const clamped = Math.min(1, Math.max(0, progress));
  return direction === 'rtl' ? (1 - clamped) * trackWidth : clamped * trackWidth;
}
