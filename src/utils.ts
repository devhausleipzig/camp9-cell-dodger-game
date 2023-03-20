import { Coord2D, Bounds, Id2D } from "./types";

/**
 * Generates a random integer within the given bounds (inclusive).
 * @param min The minimum value.
 * @param max The maximum value.
 */
export function getRandomInt(min: number, max: number) {
	const leftBound = min;
	const span = Math.abs(min - max);

	return leftBound + Math.floor(Math.random() * (span + 1));
}

/**
 * Generates a random coordinate tuple within the given boundaries.
 * @param xRange The range of the x value.
 * @param yRange The range of the y value.
 */
export function random2DCoord(xRange: Bounds, yRange: Bounds): Coord2D {
	return [getRandomInt(...xRange), getRandomInt(...yRange)];
}

/**
 * Convert a 2D coordinate tuple into an id string.
 * @param coordinate A 2D coordinate tuple.
 */
export function coord2DToId([x, y]: Coord2D): Id2D {
	return `${x}-${y}`;
}

/**
 * Convert a 2D id string into a coordinate tuple.
 * @param id An id string.
 */
export function id2DToCoord(id: Id2D): Coord2D {
	return id.split("-").map(Number) as Coord2D;
}

/**
 * Remove all child nodes of a DOM element.
 * @param element A DOM element.
 */
export function removeChildren(element: Element) {
	while (element.lastChild) {
		element.removeChild(element.lastChild);
	}
}

/**
 * Modulo function.
 * @param n Any integer value.
 * @param m The modulus.
 */
export function mod(n: number, m: number) {
	return ((n % m) + m) % m;
}

export function vecAdd2([x1, y1]: Coord2D, [x2, y2]: Coord2D): Coord2D {
	return [x1 + x2, y1 + y2];
}

export function vecSub2([x1, y1]: Coord2D, [x2, y2]: Coord2D): Coord2D {
	return [x2 - x1, y2 - y1];
}

export function vecSub2Torus(
	[rangeX, rangeY]: [number, number],
	[x1, y1]: Coord2D,
	[x2, y2]: Coord2D
): Coord2D {
	let dx = x2 - x1;
	let dy = y2 - y1;

	if (Math.abs(dx) > 0.5 * rangeX) {
		if (Math.sign(dx) == -1) {
			dx = rangeX + dx;
		} else {
			dx = -rangeX + dx;
		}
	}

	if (Math.abs(dy) > 0.5 * rangeY) {
		if (Math.sign(dy) == -1) {
			dy = rangeY + dy;
		} else {
			dy = -rangeY + dy;
		}
	}

	return [dx, dy];
}

export function dist2(vec1: Coord2D, vec2: Coord2D) {
	const [dx, dy] = vecSub2(vec1, vec2);
	return Math.sqrt(dx ** 2 + dy ** 2);
}

export function dist2Torus(
	[rangeX, rangeY]: [number, number],
	vec1: Coord2D,
	vec2: Coord2D
) {
	const [dx, dy] = vecSub2Torus([rangeX, rangeY], vec1, vec2);
	return Math.sqrt(dx ** 2 + dy ** 2);
}

/**
 * Boolean operator XOR (exclusive or).
 * @param a A boolean value.
 * @param b A boolean value.
 */
export function XOR(a: boolean, b: boolean) {
	return (a || b) && !(a && b);
}

/**
 * Boolean operator OR.
 * @param a A boolean value.
 * @param b A boolean value.
 */
export function OR(a: boolean, b: boolean) {
	return a || b;
}

/**
 * Boolean operator AND.
 * @param a A boolean value.
 * @param b A boolean value.
 */
export function AND(a: boolean, b: boolean) {
	return a && b;
}

/**
 * Boolean operator NOT.
 * @param a A boolean value.
 */
export function NOT(a: boolean) {
	return !a;
}

/**
 * Takes a binary function and applies it to every possible pairing
 * of elements in an array; careful, it is O(n^2) complexity.
 * @param operation A binary function that returns a single value.
 * @param arrayLike An iterable collection with a known size.
 */
export function pairwiseMap<T, O>(
	operation: (arg1: T, arg2: T) => O,
	arrayLike: ArrayLike<T>
) {
	const results: Array<O> = [];

	for (let i = 0; i < arrayLike.length; i++) {
		for (let j = i + 1; j < arrayLike.length; j++) {
			const left = arrayLike[i];
			const right = arrayLike[j];
			results.push(operation(left, right));
		}
	}

	return results;
}

/**
 * Implements the constraint of a quantifier on the output of a predicate applied to a collection.
 * @param constraint The number of elements of the collection that should be true. This corresponds to the number of elements of the collection that should satisfy the predicate.
 * @param boolean An iterable collection with a known size.
 */
export function quantifier(constraint: number, booleans: ArrayLike<boolean>) {
	constraint = mod(constraint, booleans.length);

	return (
		Array.from(booleans).reduce((accum, val) => accum + Number(val), 0) ==
		constraint
	);
}
