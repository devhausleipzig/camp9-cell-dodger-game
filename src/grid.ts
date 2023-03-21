import {
	Coin,
	Door,
	Enemy,
	Entity,
	Floor,
	Player,
	Stairs,
	Strawberry,
	Wall
} from "./entities";
import { BinaryPred, Bounds2D, Coord2D } from "./types";
import { coord2DToId, random2DCoord, removeChildren } from "./utils";

export class GameGrid {
	public entities: Entity<Coord2D>[][];
	public players: Player[];
	public enemies: Enemy[];
	public coins: Coin[];
	public strawberry: Strawberry[];
	public walls: Wall[];
	public floors: Floor[];
	public doors: Door[];
	public stairs: Stairs[];

	constructor(public grid: HTMLElement, public size: number) {
		this.size = size;
		this.grid = grid;
		this.players = [];
		this.enemies = [];
		this.coins = [];
		this.strawberry = [];
		this.walls = [];
		this.floors = [];
		this.doors = [];
		this.stairs = [];
		this.entities = [
			this.players,
			this.enemies,
			this.coins,
			this.strawberry,
			this.walls,
			this.floors,
			this.doors,
			this.stairs
		];

		grid.style.gridTemplateRows = `repeat(${size}, 1fr)`;
		grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
	}

	init() {
		for (let rows = 0; rows <= Number(this.size) - 1; rows++) {
			for (let columns = 0; columns <= Number(this.size) - 1; columns++) {
				const gridSquare = document.createElement("div");
				const id = coord2DToId([rows, columns]);
				gridSquare.id = id;

				gridSquare.classList.add("grid-square");
				gridSquare.style.width = `${600 / Number(this.size)}px`;
				gridSquare.style.height = `${600 / Number(this.size)}px`;
				gridSquare.style.border = `${
					2 / (8 * (Number(this.size) - 3) + 1)
				}px solid black`;

				this.grid.appendChild(gridSquare);
			}
		}
	}

	reset() {
		this.players = [];
		this.enemies = [];
		this.coins = [];
		this.strawberry = [];
		this.walls = [];
		this.floors = [];
		this.doors = [];
		this.stairs = [];
		this.entities = [
			this.players,
			this.enemies,
			this.coins,
			this.strawberry,
			this.walls,
			this.floors,
			this.doors,
			this.stairs
		];

		removeChildren(this.grid);
		this.init();
	}

	render() {
		removeChildren(this.grid);
		this.init();

		const allEntities = this.entities.flat();
		allEntities.forEach((entity) => {
			const gridSquare = document.getElementById(
				coord2DToId(entity.position)
			)!;
			gridSquare.classList.add(...entity.styles);
		});
	}

	generateLocations(quantity: number, predicates: BinaryPred<Coord2D>[]) {
		const newLocations = [];

		while (newLocations.length < quantity) {
			const location = random2DCoord(
				[0, this.size - 1],
				[0, this.size - 1]
			);

			const allEntities = this.entities.flat();
			const entityPositions = allEntities.map(
				(entity) => entity.position
			);

			let flag = true;
			for (const predicate of predicates) {
				// go over the array of all entities, for each of them execute the callback; if any of the elements in the array return true, then flag = false
				flag =
					flag && !entityPositions.some(predicate.bind({}, location));
			}

			if (flag) {
				newLocations.push(location);
			}
		}

		return newLocations;
	}

	public getEntitiesAt(position: Coord2D): Entity<Coord2D>[] {
		const allEntities = this.entities.flat();

		return allEntities.filter((entity) => {
			const [row1, column1] = entity.position;
			const [row2, column2] = position;

			return row1 === row2 && column1 === column2;
		});
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
