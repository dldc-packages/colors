export type Vector = [number, number];

/**
 * Used by the valuesLookup function to set axis, tension etc.
 */
interface LookupOptions {
  axis?: number;
  tension?: number;
  margin?: number;
  max?: number;
  processXY?: boolean;
}

const EPS = Math.pow(2, -42);

/**
 * Cubic curve interpolator
 */
export function CurveInterpolator(pts: Vector[], tension = 0.5) {
  const points = pts.length > 0 && pts.length < 4 ? extrapolateArgs(pts) : pts;
  const _lmargin = 0.5;

  function y(x: number, margin: number = _lmargin): number {
    const matches = valuesLookup(x, points, {
      axis: 0,
      tension: tension,
      max: 1,
      margin,
    }) as number[];

    return matches[0];
  }

  return y;
}

/**
 * Extrapolates input array if points have length less than 4 by copying first and last
 * points, so there is a minimum of 4 control points (required to do cubic spline calculations)
 */
function extrapolateArgs(args: Vector[]): Vector[] {
  if (args.length < 4) {
    args.unshift(args[0]);
  }
  while (args.length < 4) {
    args.push(args[args.length - 1]);
  }
  return args;
}

/**
 * Looks up values intersecting the curve at either the x-axis or y-axis.
 * @param lookup lookup value along the axis
 * @param points control points
 * @param options lookup options to control axis, tension, max solutions etc.
 */
function valuesLookup(
  lookup: number,
  points: Vector[],
  options?: LookupOptions,
): Vector[] | number[] {
  const { axis, tension, margin, max, processXY } = {
    axis: 0,
    tension: 0.5,
    margin: 0.5,
    max: 0,
    processXY: false,
    ...options,
  };

  const k = axis;
  const l = k ? 0 : 1;

  const solutions = new Set<any>();

  for (let i = 1; i < points.length; i++) {
    const idx = max < 0 ? points.length - i : i;

    const p1 = points[idx - 1];
    const p2 = points[idx];

    let vmin, vmax;
    if (p1[k] < p2[k]) {
      vmin = p1[k];
      vmax = p2[k];
    } else {
      vmin = p2[k];
      vmax = p1[k];
    }

    if (lookup - margin <= vmax && lookup + margin >= vmin) {
      const p0 = points[idx - 1 === 0 ? 0 : idx - 2];
      const p3 = points[idx > points.length - 2 ? points.length - 1 : idx + 1];
      const ts = getTAtValue(lookup, tension, p0[k], p1[k], p2[k], p3[k]);

      // sort on t to solve in order of curve length if max != 0
      if (max < 0) ts.sort((a, b) => b - a);
      else if (max >= 0) ts.sort((a, b) => a - b);

      for (let j = 0; j < ts.length; j++) {
        const v = solveForT(ts[j], tension, p0[l], p1[l], p2[l], p3[l]);
        if (processXY) {
          const av = solveForT(ts[j], tension, p0[k], p1[k], p2[k], p3[k]);
          const pt = axis === 0 ? [av, v] : [v, av];
          solutions.add(pt);
        } else {
          solutions.add(v);
        }
        if (solutions.size === Math.abs(max)) return Array.from(solutions);
      }
    }
  }

  return Array.from(solutions);
}

/**
 * Plugs point values into spline equation and return the result
 * @param t interpolation time
 * @param tension curve tension
 * @param v0 value of first control point
 * @param v1 value of second control point
 * @param v2 value of third control point
 * @param v3 value of fourth control point
 */
function solveForT(
  t: number,
  tension: number,
  v0: number,
  v1: number,
  v2: number,
  v3: number,
): number {
  if (Math.abs(t) < EPS) return v1;
  if (Math.abs(1 - t) < EPS) return v2;
  const t2 = t * t;
  const t3 = t * t2;
  const [a, b, c, d] = getCoefficients(v0, v1, v2, v3, 0, tension);
  return a * t3 + b * t2 + c * t + d;
}

function getTAtValue(
  lookup: number,
  tension: number,
  v0: number,
  v1: number,
  v2: number,
  v3: number,
): number[] {
  const [a, b, c, d] = getCoefficients(v0, v1, v2, v3, lookup, tension);
  if (a === 0 && b === 0 && c === 0 && d === 0) {
    return [0]; // whole segment matches - how to deal with this?
  }
  const roots = getCubicRoots(a, b, c, d);
  return roots.filter((t) => t > -EPS && t <= 1 + EPS).map((t) =>
    clamp(t, 0, 1)
  );
}

/**
 * Calculate coefficients from point values and optional target value for a spline
 * curve with a specified tension
 * @param v0 value of first control point
 * @param v1 value of second control point
 * @param v2 value of third control point
 * @param v3 value of fourth control point
 * @param v target value
 * @param tension curve tension
 */
function getCoefficients(
  v0: number,
  v1: number,
  v2: number,
  v3: number,
  v: number = 0,
  tension: number = 0.5,
): [number, number, number, number] {
  const c = (1 - tension) * (v2 - v0) * 0.5;
  const x = (1 - tension) * (v3 - v1) * 0.5;
  const a = 2 * v1 - 2 * v2 + c + x;
  const b = -3 * v1 + 3 * v2 - 2 * c - x;
  const d = v1 - v;
  return [a, b, c, d];
}

/**
 * Solve 2nd degree equations
 * @param a 2nd degree coefficient
 * @param b 1st degree coefficient
 * @param c constant coefficient
 */
function getQuadRoots(a: number, b: number, c: number): number[] {
  if (Math.abs(a) < EPS) {
    // Linear case, ax+b=0
    if (Math.abs(b) < EPS) return []; // Degenerate case
    return [-c / b];
  }
  const D = b * b - 4 * a * c;
  if (Math.abs(D) < EPS) return [-b / (2 * a)];

  if (D > 0) {
    return [(-b + Math.sqrt(D)) / (2 * a), (-b - Math.sqrt(D)) / (2 * a)];
  }
  return [];
}

/**
 * Solve 3rd degree equations
 * @param a 3rd degree coefficient
 * @param b 2nd degree coefficient
 * @param c 1st degree coefficient
 * @param d constant coefficient
 */
function getCubicRoots(a: number, b: number, c: number, d: number): number[] {
  if (Math.abs(a) < EPS) {
    // Quadratic case, ax^2+bx+c=0
    return getQuadRoots(b, c, d);
  }

  // Convert to depressed cubic t^3+pt+q = 0 (subst x = t - b/3a)
  const p = (3 * a * c - b * b) / (3 * a * a);
  const q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
  let roots: number[];

  if (Math.abs(p) < EPS) {
    // p = 0 -> t^3 = -q -> t = -q^1/3
    roots = [cuberoot(-q)];
  } else if (Math.abs(q) < EPS) {
    // q = 0 -> t^3 + pt = 0 -> t(t^2+p)=0
    roots = [0].concat(p < 0 ? [Math.sqrt(-p), -Math.sqrt(-p)] : []);
  } else {
    const D = (q * q) / 4 + (p * p * p) / 27;
    if (Math.abs(D) < EPS) {
      // D = 0 -> two roots
      roots = [(-1.5 * q) / p, (3 * q) / p];
    } else if (D > 0) {
      // Only one real root
      const u = cuberoot(-q / 2 - Math.sqrt(D));
      roots = [u - p / (3 * u)];
    } else {
      // D < 0, three roots, but needs to use complex numbers/trigonometric solution
      const u = 2 * Math.sqrt(-p / 3);
      const t = Math.acos((3 * q) / p / u) / 3; // D < 0 implies p < 0 and acos argument in [-1..1]
      const k = (2 * Math.PI) / 3;
      roots = [u * Math.cos(t), u * Math.cos(t - k), u * Math.cos(t - 2 * k)];
    }
  }

  // Convert back from depressed cubic
  for (let i = 0; i < roots.length; i++) {
    roots[i] -= b / (3 * a);
  }

  return roots;
}

/**
 * Take the cube root of a number
 * @param x value to return the cube root of
 */
function cuberoot(x: number): number {
  const y = Math.pow(Math.abs(x), 1 / 3);
  return x < 0 ? -y : y;
}

/**
 * Clamp an input value to min and max
 * @param value input value
 * @param min min value
 * @param max max value
 */
function clamp(value: number, min: number = 0, max: number = 1): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
