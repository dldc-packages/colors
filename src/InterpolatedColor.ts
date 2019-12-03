import Color from 'color';
import { CurveInterpolator, Vector } from './CurveInterpolator';

export type Point = [number, string];
export type PointObject = { x: number; color: string };
export type Points = Array<PointObject | Point>;

type HSL = { h: number; s: number; l: number };

export function InterpolatedColor(points: Points) {
  // Validate points
  if (points.length < 2) {
    throw new Error(`Not enough points`);
  }
  const pointsResolved: Array<Point> = points.map(p => (Array.isArray(p) ? p : [p.x, p.color]));
  const pointsSorted = pointsResolved.sort((left, right) => right[0] - left[0]);
  const pointsHsl = pointsSorted.map((p): [number, HSL] => [
    p[0],
    Color(p[1])
      .hsl()
      .object() as HSL,
  ]);
  const hPoints = pointsHsl.map((p): Vector => [p[0], p[1].h]);
  // fix hue
  // 355 -> 5
  // 355 -> 365
  hPoints.forEach((v, i) => {
    const prev = hPoints[i - 1];
    if (prev) {
      const diff = prev[1] - v[1];
      if (diff > 180) {
        v[1] = prev[1] - (360 - diff);
      }
      if (diff < -180) {
        v[1] = prev[1] + (360 - diff);
      }
    }
  });
  const sPoints = pointsHsl.map((p): Vector => [p[0], p[1].s]);
  const lPoints = pointsHsl.map((p): Vector => [p[0], p[1].l]);

  const hCurve = CurveInterpolator(hPoints);
  const sCurve = CurveInterpolator(sPoints);
  const lCurve = CurveInterpolator(lPoints);

  return (val: number) => {
    return Color({ h: hCurve(val), s: sCurve(val), l: lCurve(val) }, 'hsl')
      .hex()
      .toString();
  };

  console.log(pointsSorted);
}
