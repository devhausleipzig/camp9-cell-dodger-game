import {
	Coin,
	Door,
	Enemy,
	Entity,
	Floor,
	Player,
	Stairs,
	Wall
} from "./entities";
import { BinaryPred, Bounds2D, Coord2D } from "./types";
import {
	coord2DToId,
	dist2Torus,
	mod,
	random2DCoord,
	removeChildren,
	vecSub2Torus
} from "./utils";
import gameConfig from "./config.json";
import _ from "lodash";
import gameParams from "./config.json";

const collisionPred: BinaryPred<Coord2D> = function (location1, location2) {
	const [row1, column1] = location1;
	const [row2, column2] = location2;

	return row1 === row2 && column1 === column2;
};

const minDistPred: BinaryPred<Coord2D> = function (location1, location2) {
	return (
		dist2Torus(
			[gameParams.game.size, gameParams.game.size],
			location1,
			location2
		) <= gameParams.game.minEnemyDist
	);
};

export class GameGrid {
	public entities: Entity<Coord2D>[][];
	public players: Player[];
	public enemies: Enemy[];
	public coins: Coin[];
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
		this.walls = [];
		this.floors = [];
		this.doors = [];
		this.stairs = [];
		this.entities = [
			this.players,
			this.enemies,
			this.coins,
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
		this.walls = [];
		this.floors = [];
		this.doors = [];
		this.stairs = [];
		this.entities = [
			this.players,
			this.enemies,
			this.coins,
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
			gridSquare.classList.add(...entity.colors);
		});
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

type GameParams = typeof gameConfig;

export class Settings {
	public gameParams: GameParams;

	constructor() {
		this.gameParams = _.cloneDeep(gameConfig);
	}

	setDefaultInputs(element: HTMLInputElement, gameParam: keyof GameParams) {
		element.value = this.gameParams[gameParam].toString();
	}

	updateInput() {}

	// setDefaultInputs(noPlayersInput, "numPlayers");
	// setDefaultInputs(noEnemiesInput, "numEnemies");
	// setDefaultInputs(defaultDelayInput, "delay");

	// updateInput(noPlayersInput, "numPlayers");
	// updateInput(noEnemiesInput, "numEnemies");
	// updateInput(defaultDelayInput, "delay");
}

type GameState = {
	score: number;
	delay: number;
	numCoins: number;
	numEnemies: number;
	gameStarted: boolean;
	gameOver: boolean;
};

export class DodgerGame {
	public gameGrid: GameGrid;
	public gameState: GameState;
	public settings: typeof gameConfig;

	constructor(
		public gameGridElement: HTMLElement,
		public scoreDisplayElement: HTMLElement,
		public gameParams: typeof gameConfig
	) {
		this.gameGrid = new GameGrid(gameGridElement, gameParams.game.size);
		this.settings = gameConfig;

		document.addEventListener("keydown", (event) => {
			if (event.key === "ArrowLeft") {
				this.gameGrid.players[0].controls.lastKeyPressed = "ArrowLeft";
			} else if (event.key === "ArrowRight") {
				this.gameGrid.players[0].controls.lastKeyPressed = "ArrowRight";
			} else if (event.key === "ArrowUp") {
				this.gameGrid.players[0].controls.lastKeyPressed = "ArrowUp";
			} else if (event.key === "ArrowDown") {
				this.gameGrid.players[0].controls.lastKeyPressed = "ArrowDown";
			}
		});

		this.gameState = {
			score: 0,
			delay: 300,
			numCoins: 2,
			numEnemies: 5,
			gameStarted: false,
			gameOver: false
		};
	}

	init() {
		this.gameGrid.init();

		let allEntities: Entity<Coord2D>[] = [];

		allEntities = this.gameGrid.entities.flat();

		const players = this.generateEntities(
			1,
			[collisionPred, minDistPred],
			allEntities
		).map((location) => {
			return new Player(
				-1,
				100,
				true,
				false,
				location,
				1,
				{},
				{
					lastKeyPressed: null,
					movement: gameConfig.controls.movement[0]
				}
			);
		});

		this.gameGrid.players.push(...players);
		allEntities = this.gameGrid.entities.flat();

		const enemies = this.generateEntities(
			5,
			[collisionPred, minDistPred],
			allEntities
		).map((location) => {
			return new Enemy(location);
		});

		this.gameGrid.enemies.push(...enemies);
		allEntities = this.gameGrid.entities.flat();

		const coins = this.generateEntities(
			2,
			[collisionPred, minDistPred],
			allEntities
		).map((location) => {
			return new Coin(-1, location);
		});

		this.gameGrid.coins.push(...coins);
	}

	checkIfScored(player: Player) {
		for (const [index, coin] of this.gameGrid.coins.entries()) {
			if (collisionPred(player.position, coin.position)) {
				console.log("COIN FOUND");
				// remove the coin
				this.gameGrid.coins.splice(index, 1);
				// add new coin
				const allEntities = this.gameGrid.entities.flat();
				const newCoins = this.generateEntities(
					1,
					[collisionPred],
					allEntities
				).map((location) => {
					return new Coin(-1, location);
				});
				this.gameGrid.coins.push(...newCoins);
				this.gameState.score++;
				this.displayScore();
			}
		}
	}

	checkIfDead(player: Player) {
		for (const [index, enemy] of this.gameGrid.enemies.entries()) {
			if (collisionPred(player.position, enemy.position)) {
				console.log("ENEMY TOUCHED");
				this.gameState.gameOver = true;
			}
		}
	}

	movePlayers() {
		type Directions = "left" | "right" | "up" | "down";

		const directionActions = {
			left: (player: Player) => {
				const [row, column] = player.position;
				player.position = [row, mod(column - 1, gameParams.game.size)];
			},
			right: (player: Player) => {
				const [row, column] = player.position;
				player.position = [row, mod(column + 1, gameParams.game.size)];
			},
			up: (player: Player) => {
				const [row, column] = player.position;
				player.position = [mod(row - 1, gameParams.game.size), column];
			},
			down: (player: Player) => {
				const [row, column] = player.position;
				player.position = [mod(row + 1, gameParams.game.size), column];
			}
		};

		for (const player of this.gameGrid.players) {
			const moveKey = player.controls.lastKeyPressed;
			if (moveKey === null) {
				continue;
			}
			const moveDirection = _.invert(Object(player.controls.movement))[
				moveKey
			] as Directions;

			const moveFunc = directionActions[moveDirection];
			moveFunc(player);
			this.checkIfScored(player);
			player.controls.lastKeyPressed = null;
		}
	}

	moveEnemies() {
		for (const enemy of this.gameGrid.enemies) {
			const playersSorted = [...this.gameGrid.players].sort(
				(player1, player2) => {
					return (
						dist2Torus(
							[gameParams.game.size, gameParams.game.size],
							enemy.position,
							player1.position
						) -
						dist2Torus(
							[gameParams.game.size, gameParams.game.size],
							enemy.position,
							player2.position
						)
					);
				}
			);

			const nearestPlayer = playersSorted[0];
			const diffVec = vecSub2Torus(
				[gameParams.game.size, gameParams.game.size],
				enemy.position,
				nearestPlayer.position
			);

			const diffX = diffVec[0];
			const diffY = diffVec[1];

			// use collision pred here, instead of custom code; requires consistent representation of points + all distance-related preds requiring a distance function as an argument

			if (diffX == 0 && diffY == 0) {
				continue;
			} else if (Math.abs(diffY) >= Math.abs(diffX)) {
				const [row, column] = enemy.position;

				enemy.position = [
					row,
					mod(
						column +
							Math.sign(diffY) * 1 * Math.round(Math.random()),
						gameParams.game.size
					)
				];
			} else {
				const [row, column] = enemy.position;

				enemy.position = [
					mod(
						row + Math.sign(diffX) * 1 * Math.round(Math.random()),
						gameParams.game.size
					),
					column
				];
			}
		}
	}

	updateGameState() {
		this.movePlayers();
		this.moveEnemies();
		for (const player of this.gameGrid.players) {
			this.checkIfDead(player);
		}
	}

	gameLoop() {
		if (!this.gameState.gameOver) {
			if (this.gameState.gameStarted) {
				this.updateGameState();
				this.gameGrid.render();
			}
			setTimeout(() => {
				window.requestAnimationFrame(this.gameLoop.bind(this));
			}, this.gameState.delay);
		}
	}

	displayScore() {
		this.scoreDisplayElement.innerText = String(this.gameState.score);
	}

	generateEntities(
		quantity: number,
		predicates: BinaryPred<Coord2D>[],
		entities: Entity<Coord2D>[]
	) {
		const newLocations = [];

		while (newLocations.length < quantity) {
			const location = random2DCoord(
				[0, this.gameGrid.size - 1],
				[0, this.gameGrid.size - 1]
			);

			let flag = true;
			const entityPositions = entities.map((entity) => entity.position);
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
}

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
