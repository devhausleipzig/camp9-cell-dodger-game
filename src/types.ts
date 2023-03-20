/**
 * A 2D coordinate tuple.
 */
export type Coord2D = [number, number];

/**
 * A 2D id string.
 */
export type Id2D = `${number}-${number}`;

/**
 * A left and right bound; inclusive or exclusive.
 */
export type Bounds = [number, number];

/**
 * Two sets of left and right bounds; inclusive or exclusive.
 */
export type Bounds2D = [Bounds, Bounds];

/**
 * A binary boolean predicate.
 */
export type BinaryPred<T> = (element1: T, element2: T) => boolean;
