import { Coord2D } from "./types";

export interface Entity<L> {
	color: string;
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
	move<L>(): never;
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
	public color: string;
	public lifetime: number;
	public weight: number;
	public blocking: boolean;
	public carryable: boolean;
	public position: Coord2D;
	public speed: number;

	constructor(
		color: string,
		lifetime: number,
		weight: number,
		blocking: boolean,
		carryable: boolean,
		position: Coord2D,
		speed: number
	) {
		this.color = color;
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

	public move(): never {
		throw new Error("Method not implemented.");
	}
}

export abstract class DynamicGridEntity
	extends GridEntity
	implements DynamicEntity<Coord2D>
{
	constructor(
		color: string,
		lifetime: number,
		weight: number,
		blocking: boolean,
		carryable: boolean,
		position: Coord2D,
		speed: number
	) {
		super(color, lifetime, weight, blocking, carryable, position, speed);
	}

	public move(): never {
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
		color: string,
		lifetime: number,
		weight: number,
		blocking: boolean,
		carryable: boolean,
		position: Coord2D,
		speed: number,
		languages: Record<string, number>
	) {
		super(color, lifetime, weight, blocking, carryable, position, speed);
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
	public controls: Record<string, string>;

	constructor(
		color: string,
		lifetime: number,
		weight: number,
		blocking: boolean,
		carryable: boolean,
		position: Coord2D,
		speed: number,
		languages: Record<string, number>,
		controls: Record<string, string>
	) {
		super(
			color,
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
}

export class Enemy extends DynamicGridEntity {
	constructor(position: Coord2D) {
		const color = "bg-red-500";
		const lifetime = -1;
		const weight = 1000;
		const blocking = true;
		const carryable = false;
		const speed = 0.5;
		super(color, lifetime, weight, blocking, carryable, position, speed);
	}
}

export class Coin extends GridEntity {
	constructor(lifetime: number, position: Coord2D) {
		const color = "bg-yellow-500";
		const weight = 0;
		const blocking = false;
		const carryable = true;
		const speed = 0;
		super(color, lifetime, weight, blocking, carryable, position, speed);
	}
}

export class Wall extends GridEntity {
	constructor(position: Coord2D) {
		const color = "bg-grey-500";
		const lifetime = -1;
		const weight = -1;
		const blocking = true;
		const carryable = false;
		const speed = 0;
		super(color, lifetime, weight, blocking, carryable, position, speed);
	}
}

export class Floor extends GridEntity {
	constructor(position: Coord2D) {
		const color = "bg-black";
		const lifetime = -1;
		const weight = -1;
		const blocking = false;
		const carryable = false;
		const speed = -1;
		super(color, lifetime, weight, blocking, carryable, position, speed);
	}
}

export class Door extends GridEntity {
	constructor(position: Coord2D) {
		const color = "bg-amber-800";
		const lifetime = -1;
		const weight = -1;
		const blocking = true;
		const carryable = false;
		const speed = -1;
		super(color, lifetime, weight, blocking, carryable, position, speed);
	}

	public open(): void {
		this.blocking = false;
		this.color = "bg-gradient-to-r from-amber-800 to-gray-100";
	}
}

export class Stairs extends GridEntity {
	constructor(position: Coord2D) {
		const color = "bg-gray-100";
		const lifetime = -1;
		const weight = -1;
		const blocking = false;
		const carryable = false;
		const speed = -1;
		super(color, lifetime, weight, blocking, carryable, position, speed);
	}
}
