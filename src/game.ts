import {
	Coin,
	Door,
	Enemy,
	Entity,
	Floor,
	GridEntity,
	Player,
	Stairs,
	Wall
} from "./entities";
import { BinaryPred, Bounds2D, Coord2D } from "./types";
import { coord2DToId, removeChildren } from "./utils";
import gameConfig from "./config.json";

export class EffectFactory<L> {
	constructor(
		lifetime: number,
		locations: L[],
		effect: (location: L) => void
	) {
		return class Effect {
			public lifetime: number;
			public locations: L[];
			public effect: (location: L) => void;

			constructor() {
				this.lifetime = lifetime;
				this.locations = locations;
				this.effect = effect;
			}
		};
	}
}

const collisionPred: BinaryPred<GridEntity> = function (entity1, entity2) {
	const [row1, column1] = entity1.position;
	const [row2, column2] = entity2.position;

	return row1 === row2 && column1 === column2;
};

const minDistPred: BinaryPred<GridEntity> = function (entity1, entity2) {
	return dist2(entity1.position, entity2.position) >= gameParams.minEnemyDist;
};

export class Grid {
	public entities: Entity<Coord2D>[];
	public players: Player[];
	public enemies: Enemy[];
	public coins: Coin[];
	public walls: Wall[];
	public floors: Floor[];
	public doors: Door[];
	public stairs: Stairs[];

	constructor(public grid: HTMLElement, private _size: number) {
		this._size = _size;
		this.entities = [];
		this.players = [];
		this.enemies = [];
		this.coins = [];
		this.walls = [];
		this.floors = [];
		this.doors = [];
		this.stairs = [];

		grid.style.gridTemplateRows = `repeat(${_size}, 1fr)`;
		grid.style.gridTemplateColumns = `repeat(${_size}, 1fr)`;
	}

	init() {
		for (let i = 1; i <= Number(this._size); i++) {
			for (let j = 1; j <= Number(this._size); j++) {
				const gridSquare = document.createElement("div");
				const id = coord2DToId([i, j]);
				gridSquare.id = id;

				gridSquare.classList.add("grid-square");
				gridSquare.style.width = `${600 / Number(this._size)}px`;
				gridSquare.style.height = `${600 / Number(this._size)}px`;
				gridSquare.style.border = `${
					2 / (8 * (Number(this._size) - 3) + 1)
				}px solid black`;

				this.grid.appendChild(gridSquare);
			}
		}

		// generate entities here
	}

	reset() {
		this.entities = [];
		this.players = [];
		this.enemies = [];
		this.coins = [];
		this.walls = [];
		this.floors = [];
		this.doors = [];
		this.stairs = [];

		removeChildren(this.grid);
		this.init();
	}

	render() {
		removeChildren(this.grid);
		this.init();

		this.entities.forEach((entity) => {
			const gridSquare = document.getElementById(
				coord2DToId(entity.position)
			)!;
			gridSquare.classList.add(entity.color);
		});
	}

	public getEntitiesAt(position: Coord2D): Entity<Coord2D>[] {
		return this.entities.filter((entity) =>
			positionEquals(position, entity.position)
		);
	}

	public getEntitiesInArea(area: Bounds2D): Entity<Coord2D>[] {
		const entities = [];

		for (let i = area[0][0]; i <= area[1][0]; i++) {
			for (let j = area[0][1]; j <= area[1][1]; j++) {
				entities.push(...this.getEntitiesAt([i, j]));
			}
		}

		return entities;
	}

	// public getEntitiesInRadius(
	// 	radius: number,
	// 	center: Coord2D,
	// 	entities: Entity<Coord2D>[]
	// ): Entity<Coord2D>[] {
	// }

	// public getEntitiesInLine(
	// 	start: Coord2D,
	// 	end: Coord2D,
	// 	entities: Entity<Coord2D>[]
	// ): Entity<Coord2D>[] {
	// }

	// public getEntitiesInDirection(
	// 	direction: Coord2D,
	// 	center: Coord2D,
	// 	entities: Entity<Coord2D>[]
	// ): Entity<Coord2D>[] {
	// }

	// public getEntitiesInSight(
	// 	radius: number,
	// 	center: Coord2D,
	// 	entities: Entity<Coord2D>[] = this.entities
	// ): Entity<Coord2D>[] {
	// }

	// public getEntitiesInSightInDirection(
	// 	radius: number,
	// 	direction: Coord2D,
	// 	center: Coord2D,
	// 	entities: Entity<Coord2D>[] = this.entities
	// ): Entity<Coord2D>[] {
	// }

	// public getEntitiesInSightInLine(
	// 	radius: number,
	// 	start: Coord2D,
	// 	end: Coord2D,
	// 	entities: Entity<Coord2D>[] = this.entities
	// ): Entity<Coord2D>[] {
	// }
}

export class Settings {}

export class Game {}
