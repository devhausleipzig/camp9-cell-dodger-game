import { Coin, Enemy, Entity, Player, Wall } from "./entities";
import { BinaryPred, Coord2D } from "./types";
import { coord2DToId, dist2Torus, mod, vecSub2Torus } from "./utils";
import gameConfig from "./config.json";
import _ from "lodash";
import gameParams from "./config.json";
import { GameGrid } from "./grid";

export const collisionPred: BinaryPred<Coord2D> = function (
	location1,
	location2
) {
	const [row1, column1] = location1;
	const [row2, column2] = location2;

	return row1 === row2 && column1 === column2;
};

export const minDistPred: BinaryPred<Coord2D> = function (
	location1,
	location2
) {
	return (
		dist2Torus(
			[gameParams.game.size, gameParams.game.size],
			location1,
			location2
		) <= gameParams.game.minEnemyDist
	);
};

type GameParams = typeof gameConfig;

export class Settings {
	public controls: GameParams["controls"];
	public game: GameParams["game"];

	constructor() {
		const gameParams = _.cloneDeep(gameConfig);
		this.controls = gameParams.controls;
		this.game = gameParams.game;
	}

	setDefaultInputs(
		element: HTMLInputElement,
		gameParam: keyof typeof this.game
	) {
		element.value = this.game[gameParam].toString();
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

		const walls = this.gameGrid
			.generateLocations(15, [collisionPred])
			.map((position) => {
				return new Wall({ ...Wall.default, position });
			});

		this.gameGrid.walls.push(...walls);
		allEntities = this.gameGrid.entities.flat();

		const players = this.gameGrid
			.generateLocations(1, [collisionPred, minDistPred])
			.map((position) => {
				return new Player({
					...Player.default,
					position,
					controls: {
						lastKeyPressed: null,
						movement: gameConfig.controls.movement[0]
					}
				});
			});

		this.gameGrid.players.push(...players);
		allEntities = this.gameGrid.entities.flat();

		const enemies = this.gameGrid
			.generateLocations(5, [collisionPred, minDistPred])
			.map((position) => {
				return new Enemy({ ...Enemy.default, position });
			});

		this.gameGrid.enemies.push(...enemies);
		allEntities = this.gameGrid.entities.flat();

		const coins = this.gameGrid
			.generateLocations(2, [collisionPred, minDistPred])
			.map((position) => {
				return new Coin({ ...Coin.default, position });
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
				const newCoins = this.gameGrid
					.generateLocations(1, [collisionPred])
					.map((position) => {
						return new Coin({ ...Coin.default, position });
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
		const allEntities = this.gameGrid.entities.flat();

		const directionActions = {
			left: (player: Player) => {
				player.move(([row, column]) => {
					const newMove: Coord2D = [
						row,
						mod(column - 1, gameParams.game.size)
					];

					const newMoveBlocked = allEntities.some((entity) => {
						if (entity.blocking) {
							return collisionPred(newMove, entity.position);
						}

						return false;
					});

					if (!newMoveBlocked) {
						return newMove;
					}

					return [row, column];
				});
			},
			right: (player: Player) => {
				player.move(([row, column]) => {
					const newMove: Coord2D = [
						row,
						mod(column + 1, gameParams.game.size)
					];

					const newMoveBlocked = allEntities.some((entity) => {
						if (entity.blocking) {
							return collisionPred(newMove, entity.position);
						}

						return false;
					});

					if (!newMoveBlocked) {
						return newMove;
					}

					return [row, column];
				});
			},
			up: (player: Player) => {
				player.move(([row, column]) => {
					const newMove: Coord2D = [
						mod(row - 1, gameParams.game.size),
						column
					];

					const newMoveBlocked = allEntities.some((entity) => {
						if (entity.blocking) {
							return collisionPred(newMove, entity.position);
						}

						return false;
					});

					if (!newMoveBlocked) {
						return newMove;
					}

					return [row, column];
				});
			},
			down: (player: Player) => {
				player.move(([row, column]) => {
					const newMove: Coord2D = [
						mod(row + 1, gameParams.game.size),
						column
					];

					const newMoveBlocked = allEntities.some((entity) => {
						if (entity.blocking) {
							return collisionPred(newMove, entity.position);
						}

						return false;
					});

					if (!newMoveBlocked) {
						return newMove;
					}

					return [row, column];
				});
			}
		};

		for (const player of this.gameGrid.players) {
			const moveKey = player.controls.lastKeyPressed;
			if (moveKey === null) {
				continue;
			}

			type Directions = keyof typeof player.controls.movement;

			const moveDirection = _.invert(Object(player.controls.movement))[
				moveKey
			] as Directions;

			directionActions[moveDirection](player);
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

			const [diffRow, diffColumn] = diffVec;
			const allEntities = this.gameGrid.entities.flat();
			const moveDistance = 1;

			enemy.move(([row, column]) => {
				if (diffRow == 0 && diffColumn == 0) {
					return [row, column];
				}

				const ColumnGreater = Math.abs(diffColumn) >= Math.abs(diffRow);

				const rowMove: Coord2D = [
					mod(
						row + Math.sign(diffRow) * moveDistance,
						gameParams.game.size
					),
					column
				];

				const columnMove: Coord2D = [
					row,
					mod(
						column + Math.sign(diffColumn) * moveDistance,
						gameParams.game.size
					)
				];

				const firstMove = ColumnGreater ? rowMove : columnMove;
				const secondMove = ColumnGreater ? columnMove : rowMove;

				const firstMoveBlocked = allEntities.some((entity) => {
					if (entity.blocking) {
						return collisionPred(firstMove, entity.position);
					}

					return false;
				});

				if (!firstMoveBlocked) {
					return firstMove;
				}

				const secondMoveBlocked = allEntities.some((entity) => {
					if (entity.blocking) {
						return collisionPred(secondMove, entity.position);
					}

					return false;
				});

				if (!secondMoveBlocked) {
					return secondMove;
				}

				const lateralMove: Coord2D = [
					ColumnGreater
						? mod(
								row +
									Math.sign(diffRow) * moveDistance +
									Math.sign(diffRow) * -2,
								gameParams.game.size
						  )
						: row,
					ColumnGreater
						? column
						: mod(
								column +
									Math.sign(diffColumn) * moveDistance +
									Math.sign(diffRow) * -2,
								gameParams.game.size
						  )
				];

				const laterMoveBlocked = allEntities.some((entity) => {
					if (entity.blocking) {
						return collisionPred(lateralMove, entity.position);
					}

					return false;
				});

				if (!laterMoveBlocked) {
					return lateralMove;
				}

				return [row, column];
			});
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
}

abstract class Effect<L> {
	public lifetime: number;
	public locations: L[];
	public effect: (location: L) => void;

	constructor(
		lifetime: number,
		locations: L[],
		effect: (location: L) => void
	) {
		this.lifetime = lifetime;
		this.locations = locations;
		this.effect = effect;
	}
}
