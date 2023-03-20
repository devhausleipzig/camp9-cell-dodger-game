import { Coord2D } from "./types";

// abstract is a TypeScript only keyword
// public & private are Tyescript only keywords (you can create private members in JavaScript with '#')
// in JavaScript, a class can only extend from/inherit from one other class
// however, an interface can extend from multiple interfaces
// in REAL OOP languages, a class can extend from multiple classes
// we can simulate this in TypeScript by using interfaces & abstract classes together

export interface Entity<L> {
	colors: string[];
	lifetime: number;
	weight: number;
	blocking: boolean;
	carryable: boolean;
	position: L;
	age(): never;
	die(): never;
	revive(): never;
	destroy(): never;
	sound(): never;
	move<L>(): void;
}

export interface DynamicEntity<L> extends Entity<L> {
	interact(entity: Entity<L>): never;
	attack(locations: L[]): never;
	carry(entity: Entity<L>): never;
	place(entity: Entity<L>): never;
}

export interface SentientEntity<L> extends Entity<L> {
	communicationModes: Record<string, number>;
	converse(entities: SentientEntity<L>[]): never;
}

export abstract class GridEntity implements Entity<Coord2D> {
	public colors: string[];
	public lifetime: number;
	public weight: number;
	public blocking: boolean;
	public carryable: boolean;
	public position: Coord2D;
	public speed: number;

	constructor(
		colors: string[],
		lifetime: number,
		weight: number,
		blocking: boolean,
		carryable: boolean,
		position: Coord2D,
		speed: number
	) {
		this.colors = colors;
		this.lifetime = lifetime;
		this.weight = weight;
		this.blocking = blocking;
		this.carryable = carryable;
		this.position = position;
		this.speed = speed;
	}

	public age(): never {
		throw new Error("Method not implemented.");
	}

	public die(): never {
		throw new Error("Method not implemented.");
	}

	public revive(): never {
		throw new Error("Method not implemented.");
	}

	public destroy(): never {
		throw new Error("Method not implemented.");
	}

	public sound(): never {
		throw new Error("Method not implemented.");
	}

	public move(): void {
		throw new Error("Method not implemented.");
	}
}

export abstract class DynamicGridEntity
	extends GridEntity
	implements DynamicEntity<Coord2D>
{
	constructor(
		colors: string[],
		lifetime: number,
		weight: number,
		blocking: boolean,
		carryable: boolean,
		position: Coord2D,
		speed: number
	) {
		super(colors, lifetime, weight, blocking, carryable, position, speed);
	}

	public move(): void {
		throw new Error("Method not implemented.");
	}

	public interact(entity: Entity<Coord2D>): never {
		throw new Error("Method not implemented.");
	}

	public attack(locations: Coord2D[]): never {
		throw new Error("Method not implemented.");
	}

	public carry(entity: Entity<Coord2D>): never {
		throw new Error("Method not implemented.");
	}

	public place(entity: Entity<Coord2D>): never {
		throw new Error("Method not implemented.");
	}
}

export abstract class SentientGridEntity<S, L> extends DynamicGridEntity {
	public languages: Record<string, number>;

	constructor(
		colors: string[],
		lifetime: number,
		weight: number,
		blocking: boolean,
		carryable: boolean,
		position: Coord2D,
		speed: number,
		languages: Record<string, number>
	) {
		super(colors, lifetime, weight, blocking, carryable, position, speed);
		this.languages = languages;
	}

	public converse(entities: S): never {
		throw new Error("Method not implemented.");
	}
}

export type Controls = {
	lastKeyPressed: string | null;
	movement: { left: string; up: string; right: string; down: string };
};

export class Player extends SentientGridEntity<Player, Coord2D> {
	public controls: Controls;

	constructor(
		lifetime: number,
		weight: number,
		blocking: boolean,
		carryable: boolean,
		position: Coord2D,
		speed: number,
		languages: Record<string, number>,
		controls: Controls
	) {
		const colors = ["bg-blue-500"];

		super(
			colors,
			lifetime,
			weight,
			blocking,
			carryable,
			position,
			speed,
			languages
		);

		this.controls = controls;
	}

	public move(): void {
		// move player
	}
}

export class Enemy extends DynamicGridEntity {
	constructor(position: Coord2D) {
		const colors = ["bg-red-500"];
		const lifetime = -1;
		const weight = 1000;
		const blocking = true;
		const carryable = false;
		const speed = 0.5;
		super(colors, lifetime, weight, blocking, carryable, position, speed);
	}
}

export class Coin extends GridEntity {
	constructor(lifetime: number, position: Coord2D) {
		const colors = ["bg-yellow-500"];
		const weight = 0;
		const blocking = false;
		const carryable = true;
		const speed = 0;
		super(colors, lifetime, weight, blocking, carryable, position, speed);
	}
}

export class Wall extends GridEntity {
	constructor(position: Coord2D) {
		const colors = ["bg-black"];
		const lifetime = -1;
		const weight = -1;
		const blocking = true;
		const carryable = false;
		const speed = 0;
		super(colors, lifetime, weight, blocking, carryable, position, speed);
	}
}

export class Floor extends GridEntity {
	constructor(position: Coord2D) {
		const colors = ["bg-zinc-300"];
		const lifetime = -1;
		const weight = -1;
		const blocking = false;
		const carryable = false;
		const speed = -1;
		super(colors, lifetime, weight, blocking, carryable, position, speed);
	}
}

export class Door extends GridEntity {
	constructor(position: Coord2D) {
		const colors = ["bg-amber-800"];
		const lifetime = -1;
		const weight = -1;
		const blocking = true;
		const carryable = false;
		const speed = -1;
		super(colors, lifetime, weight, blocking, carryable, position, speed);
	}

	public open(): void {
		this.blocking = false;
		this.colors = ["bg-gradient-to-r", "from-amber-800", "to-gray-100"];
	}
}

export class Stairs extends GridEntity {
	constructor(position: Coord2D) {
		const colors = ["bg-gray-100"];
		const lifetime = -1;
		const weight = -1;
		const blocking = false;
		const carryable = false;
		const speed = -1;
		super(colors, lifetime, weight, blocking, carryable, position, speed);
	}
}
