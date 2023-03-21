import { collisionPred } from "./game";
import { Coord2D } from "./types";

// abstract is a TypeScript only keyword
// public & private are Typescript only keywords (you can create private members in JavaScript with '#')
// in JavaScript, a class can only extend from/inherit from one other class
// however, an interface can extend from multiple interfaces
// in REAL OOP languages, a class can extend from multiple classes
// we can simulate this in TypeScript by using interfaces & abstract classes together

export interface Entity<L> {
	styles: string[];
	lifetime: number;
	weight: number;
	blocking: boolean;
	carryable: boolean;
	position: L;
	age(): void;
	die(): void;
	revive(): void;
	destroy(): void;
	sound(): void;
	move(callback: (position: L) => L): void;
}

export interface DynamicEntity<L> extends Entity<L> {
	interact(entity: Entity<L>): void;
	attack(locations: L[]): void;
	carry(entity: Entity<L>): void;
	place(entity: Entity<L>): void;
}

export interface SentientEntity<L> extends Entity<L> {
	communicationModes: Record<string, number>;
	converse(entities: SentientEntity<L>[]): void;
}

type GridEntityArgs = {
	styles: string[];
	lifetime: number;
	weight: number;
	blocking: boolean;
	carryable: boolean;
	position: Coord2D;
	speed: number;
};

export abstract class GridEntity implements Entity<Coord2D> {
	public styles: string[];
	public lifetime: number;
	public weight: number;
	public blocking: boolean;
	public carryable: boolean;
	public speed: number;
	private _position: Coord2D;

	constructor(args: GridEntityArgs) {
		this.styles = args.styles;
		this.lifetime = args.lifetime;
		this.weight = args.weight;
		this.blocking = args.blocking;
		this.carryable = args.carryable;
		this.speed = args.speed;
		this._position = args.position;
	}

	public age() {
		throw new Error("Method not implemented.");
	}

	public die() {
		throw new Error("Method not implemented.");
	}

	public revive() {
		throw new Error("Method not implemented.");
	}

	public destroy() {
		throw new Error("Method not implemented.");
	}

	public sound() {
		throw new Error("Method not implemented.");
	}

	public get position() {
		return this._position;
	}

	public move(callback: (position: Coord2D) => Coord2D): void {
		if (Math.random() < this.speed) {
			this._position = callback(this.position);
		}
	}

	public teleport(position: Coord2D, entityPositions: Coord2D[]): void {
		if (!entityPositions.some(collisionPred.bind({}, position))) {
			this._position = position;
		}
	}
}

type DynamicGridEntityArgs = GridEntityArgs & {};

export abstract class DynamicGridEntity
	extends GridEntity
	implements DynamicEntity<Coord2D>
{
	constructor(args: DynamicGridEntityArgs) {
		super({ ...args });
	}

	public interact(entity: Entity<Coord2D>): void {
		throw new Error("Method not implemented.");
	}

	public attack(locations: Coord2D[]): void {
		throw new Error("Method not implemented.");
	}

	public carry(entity: Entity<Coord2D>): void {
		throw new Error("Method not implemented.");
	}

	public place(entity: Entity<Coord2D>): void {
		throw new Error("Method not implemented.");
	}
}

type SentientGridEntityArgs = DynamicGridEntityArgs & {
	languages: Record<string, number>;
};

export abstract class SentientGridEntity<S> extends DynamicGridEntity {
	public languages: Record<string, number>;

	constructor(args: SentientGridEntityArgs) {
		super({ ...args });
		this.languages = args.languages;
	}

	public converse(entities: S): void {
		throw new Error("Method not implemented.");
	}
}

export type Controls = {
	lastKeyPressed: string | null;
	movement: { left: string; up: string; right: string; down: string };
};

export class Player extends SentientGridEntity<Player> {
	static default = {
		styles: ["bg-blue-500"],
		lifetime: -1,
		weight: 100,
		blocking: false,
		carryable: false,
		speed: 1,
		languages: {}
	};

	public controls: Controls;

	constructor(args: SentientGridEntityArgs & { controls: Controls }) {
		super({
			...args
		});

		this.controls = args.controls;
	}
}

export class Enemy extends DynamicGridEntity {
	static default = {
		styles: ["bg-red-500"],
		lifetime: -1,
		weight: 1000,
		blocking: true,
		carryable: false,
		speed: 0.5
	};

	constructor(args: DynamicGridEntityArgs) {
		super({
			...args
		});
	}
}

export class Coin extends GridEntity {
	static default = {
		styles: ["bg-yellow-500"],
		lifetime: -1,
		weight: 0,
		blocking: false,
		carryable: true,
		speed: 0
	};

	constructor(args: GridEntityArgs) {
		super({ ...args });
	}
}

export class Wall extends GridEntity {
	static readonly default = {
		styles: ["bg-black"],
		lifetime: -1,
		weight: -1,
		blocking: true,
		carryable: false,
		speed: 0
	};

	constructor(args: GridEntityArgs) {
		super({ ...args });
	}
}

export class Floor extends GridEntity {
	static readonly default = {
		styles: ["bg-zinc-300"],
		lifetime: -1,
		weight: -1,
		blocking: false,
		carryable: false,
		speed: -1
	};

	constructor(args: GridEntityArgs) {
		super({ ...args });
	}
}

export class Door extends GridEntity {
	static readonly default = {
		styles: ["bg-amber-800"],
		lifetime: -1,
		weight: -1,
		blocking: true,
		carryable: false,
		speed: -1
	};

	private _prevStyles: string[] = [];

	constructor(args: GridEntityArgs) {
		super({ ...args });
	}

	public open(): void {
		this.blocking = false;
		this._prevStyles = this.styles;
		this.styles = ["bg-gradient-to-r", "from-amber-800", "to-gray-100"];
	}

	public close(): void {
		this.blocking = true;
		this.styles = this._prevStyles;
	}
}

export class Stairs extends GridEntity {
	static readonly default = {
		styles: ["bg-gray-100"],
		lifetime: -1,
		weight: -1,
		blocking: false,
		carryable: false,
		speed: -1
	};

	constructor(args: GridEntityArgs) {
		super({ ...args });
	}
}
