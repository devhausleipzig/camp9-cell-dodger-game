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
import {
	coord2DToId,
	dist2,
	dist2Torus,
	random2DCoord,
	removeChildren
} from "./utils";
import gameConfig from "./config.json";

const collisionPred: BinaryPred<GridEntity> = function (entity1, entity2) {
	const [row1, column1] = entity1.position;
	const [row2, column2] = entity2.position;

	return row1 === row2 && column1 === column2;
};

const minDistPred: BinaryPred<GridEntity> = function (entity1, entity2) {
	return (
		dist2Torus(
			[gameParams.size, gameParams.size],
			entity1.position,
			entity2.position
		) >= gameParams.minEnemyDist
	);
};

export class GameGrid {
	public entities: Entity<Coord2D>[];
	public players: Player[];
	public enemies: Enemy[];
	public coins: Coin[];
	public walls: Wall[];
	public floors: Floor[];
	public doors: Door[];
	public stairs: Stairs[];
	public score: number;
	public delay: number;
	public numCoins: number;
	public numEnemies: number;
	public gameStarted: boolean;
	public gameOver: boolean;

	constructor(
		public grid: HTMLElement,
		public scoreDisplay: HTMLElement,
		private _size: number
	) {
		this.score = 0;
		this.delay = 300;
		this.numCoins = 2;
		this.numEnemies = 5;
		this.gameStarted = false;
		this.gameOver = false;
		this._size = _size;
		this.grid = grid;
		this.scoreDisplay = scoreDisplay;
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
		for (let rows = 1; rows <= Number(this._size); rows++) {
			for (let columns = 1; columns <= Number(this._size); columns++) {
				const gridSquare = document.createElement("div");
				const id = coord2DToId([rows, columns]);
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
		this.players = this.generateEntities([collisionPred]);

		this.coins = this.generateEntities([collisionPred]);

		this.enemies = this.generateEntities([collisionPred, minDistPred]);
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
			gridSquare.classList.add(...entity.colors);
		});
	}

	movePlayers(players: Players) {
		for (const player of players) {
			const moveKey = player.controls.lastKeyPressed;
			if (moveKey === null) {
				continue;
			}
			const moveDirection = _.invert(Object(player.controls.movement))[
				moveKey
			] as Directions;

			const moveFunc = directionActions[moveDirection];
			moveFunc(player);
			player.controls.lastKeyPressed = null;
		}
	}

	moveEnemies(enemies: Enemies, players: Players) {
		for (const enemy of enemies) {
			const playersSorted = [...players].sort((player1, player2) => {
				return (
					dist2Torus(
						[gameParams.columns, gameParams.rows],
						[enemy.x, enemy.y],
						[player1.x, player1.y]
					) -
					dist2Torus(
						[gameParams.columns, gameParams.rows],
						[enemy.x, enemy.y],
						[player2.x, player2.y]
					)
				);
			});

			const nearestPlayer = playersSorted[0];
			const diffVec = vecSub2Torus(
				[gameParams.columns, gameParams.rows],
				[enemy.x, enemy.y],
				[nearestPlayer.x, nearestPlayer.y]
			);

			const diffX = diffVec[0];
			const diffY = diffVec[1];

			// use collision pred here, instead of custom code; requires consistent representation of points + all distance-related preds requiring a distance function as an argument

			if (diffX == 0 && diffY == 0) {
				continue;
			} else if (Math.abs(diffY) >= Math.abs(diffX)) {
				applyEntityColor(enemyColor, [enemy]);
				enemy.y = mod(
					enemy.y + Math.sign(diffY) * 1 * Math.round(Math.random()),
					gameParams.rows
				);
				applyEntityColor(enemyColor, [enemy]);
			} else {
				applyEntityColor(enemyColor, [enemy]);
				enemy.x = mod(
					enemy.x + Math.sign(diffX) * 1 * Math.round(Math.random()),
					gameParams.columns
				);
				applyEntityColor(enemyColor, [enemy]);
			}
		}
	}

	updateGameState() {
		this.movePlayers();
		this.moveEnemies();
	}

	gameLoop() {
		if (!this.gameOver) {
			if (this.gameStarted) this.updateGameState();
			setTimeout(() => {
				window.requestAnimationFrame(this.gameLoop.bind(this));
			}, this.delay);
		}
	}

	displayScore() {
		this.scoreDisplay.innerText = String(this.score);
	}

	generateEntities(
		constructor: Entity<Coord2D>["constructor"],
		quantity: number,
		predicates: BinaryPred<Entity<Coord2D>>[]
	) {
		const newLocations = [];

		while (newLocations.length < quantity) {
			const location = random2DCoord([1, this._size], [1, this._size]);

			constructor(location);

			let flag = true;
			for (const predicate of predicates) {
				// go over the array of all entities, for each of them execute the callback; if any of the elements in the array return true, then flag = false
				flag =
					flag && !this.entities.some(predicate.bind({}, location));
			}

			if (flag) {
				newLocations.push(location);
			}
		}

		return newLocations;
	}

	public getEntitiesAt(position: Coord2D): Entity<Coord2D>[] {
		return this.entities.filter((entity) => {
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

type GameParams = typeof gameConfig;

const gameParams: GameParams = _.cloneDeep(gameConfig);

export class Settings {
	constructor() {
		this.gameParams;
	}

	// setDefaultInputs(noPlayersInput, "numPlayers");
	// setDefaultInputs(noEnemiesInput, "numEnemies");
	// setDefaultInputs(defaultDelayInput, "delay");

	// updateInput(noPlayersInput, "numPlayers");
	// updateInput(noEnemiesInput, "numEnemies");
	// updateInput(defaultDelayInput, "delay");

	// function setDefaultInputs(
	// 	element: HTMLInputElement,
	// 	gameParam: keyof GameParams
	// ) {
	// 	element.value = gameParams[gameParam].toString();
	// }
}

export class Game {}

// export class EffectFactory<L> {
// 	constructor(
// 		lifetime: number,
// 		locations: L[],
// 		effect: (location: L) => void
// 	) {
// 		return class Effect {
// 			public lifetime: number;
// 			public locations: L[];
// 			public effect: (location: L) => void;

// 			constructor() {
// 				this.lifetime = lifetime;
// 				this.locations = locations;
// 				this.effect = effect;
// 			}
// 		};
// 	}
// }
