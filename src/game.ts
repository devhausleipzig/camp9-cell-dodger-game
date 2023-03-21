import { Coin, Enemy, Entity, Player, Strawberry, Wall } from "./entities";
import { BinaryPred, Coord2D } from "./types";
import {
	coord2DToId,
	dist2Torus,
	getRandomInt,
	mod,
	vecSub2Torus
} from "./utils";
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
	reversedEnemies: boolean;
	strawberryTime: number;
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

		// player1 controls hard coded here, should change it to be dynamic
		document.addEventListener("keydown", (event) => {
			// go through all the controls used by players
			// and check if the key pressed matches any of them
			if (!this.gameState.gameOver) {
				this.gameState.gameStarted = true;
			}

			if (event.key === "ArrowLeft") {
				this.gameGrid.players[0].controls.lastKeyPressed = "ArrowLeft";
			} else if (event.key === "ArrowRight") {
				this.gameGrid.players[0].controls.lastKeyPressed = "ArrowRight";
			} else if (event.key === "ArrowUp") {
				this.gameGrid.players[0].controls.lastKeyPressed = "ArrowUp";
			} else if (event.key === "ArrowDown") {
				this.gameGrid.players[0].controls.lastKeyPressed = "ArrowDown";
			} else if (event.key === "Space") {
				this.gameGrid.players[0].controls.lastKeyPressed = "Space";
			}
		});

		// this could be a class instance if we want to
		this.gameState = {
			score: 0,
			delay: 300,
			numCoins: 2,
			numEnemies: 5,
			gameStarted: false,
			gameOver: false,
			reversedEnemies: false,
			strawberryTime: 0
		};
	}

	init() {
		this.gameGrid.init();

		const walls = this.gameGrid
			.generateLocations(1, [collisionPred])
			.map((position) => {
				return new Wall({ ...Wall.default, position });
			});

		this.gameGrid.walls.push(...walls);

		const players = this.gameGrid
			.generateLocations(1, [collisionPred])
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

		const enemies = this.gameGrid
			.generateLocations(5, [collisionPred, minDistPred])
			.map((position) => {
				return new Enemy({ ...Enemy.default, position });
			});

		this.gameGrid.enemies.push(...enemies);

		const coins = this.gameGrid
			.generateLocations(2, [collisionPred, minDistPred])
			.map((position) => {
				return new Coin({ ...Coin.default, position });
			});

		this.gameGrid.coins.push(...coins);

		this.gameGrid.render();

		setInterval(() => {
			if (
				!this.gameState.gameOver &&
				this.gameState.gameStarted &&
				this.gameGrid.strawberry.length < 1
			) {
				// add strawberry to gameGrid.strawberries
				const strawberry = this.gameGrid
					.generateLocations(1, [collisionPred, minDistPred])
					.map((position) => {
						return new Strawberry({
							...Strawberry.default,
							position
						});
					});

				this.gameGrid.strawberry.push(...strawberry);

				this.gameGrid.render();
			}
		}, getRandomInt(2000, 5000));
	}

	checkIfStrawberryed(player: Player) {
		// check if player is on a strawberry
		for (const [index, strawberry] of this.gameGrid.strawberry.entries()) {
			if (collisionPred(player.position, strawberry.position)) {
				// if it is, then make enemies run away from player
				this.gameState.reversedEnemies = true;
				this.gameState.strawberryTime += 30;
				console.log("Enemies are running away from player");

				// make strawberry disappear
				while (this.gameGrid.strawberry.length > 0) {
					this.gameGrid.strawberry.pop();
					console.log("New strawberry removed");
				}

				// change score
				// allow enemies to be cached (change enemies color???)
			}
		}
	}

	checkIfMushroomed(player: Player) {
		// check if player is on a mushroom
		// if it is, then decrease the game loop delay & decrease the enemy speed
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
				if (this.gameState.reversedEnemies) {
					this.gameGrid.enemies.splice(index, 1);
					this.gameState.score++;
					this.displayScore();
					break;
				}
				this.gameState.gameOver = true;
			}
		}
	}

	movePlayers() {
		const allEntities = this.gameState.reversedEnemies
			? [
					this.gameGrid.coins,
					this.gameGrid.doors,
					this.gameGrid.floors,
					this.gameGrid.players
			  ].flat()
			: this.gameGrid.entities.flat();

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
			// teleport: (player: Player) => {
			// 	const newLocation = [0, 0];

			// 	const newLocationBlocked = allEntities.some((entity) => {
			// 		if (entity.blocking) {
			// 			return collisionPred(newLocation, entity.position);
			// 		}

			// 		return false;
			// 	});

			// 	if (!newLocationBlocked) {
			// 		player.teleport(newLocation);
			// 	}
			// }
		};

		for (const player of this.gameGrid.players) {
			const moveKey = player.controls.lastKeyPressed;
			if (moveKey === null) {
				continue;
			}

			type Directions = keyof typeof player.controls.movement;

			const moveDirection = _.invert(player.controls.movement)[
				moveKey
			] as Directions;

			directionActions[moveDirection](player);
			this.checkIfScored(player);
			// this.checkIfMushroomed(player);
			this.checkIfStrawberryed(player);
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
			let direction = 1;
			if (this.gameState.reversedEnemies) {
				direction = -1;
			}

			enemy.move(([row, column]) => {
				if (diffRow == 0 && diffColumn == 0) {
					return [row, column];
				}

				const ColumnGreater = Math.abs(diffColumn) >= Math.abs(diffRow);

				const rowMove: Coord2D = [
					mod(
						row + direction * Math.sign(diffRow) * moveDistance,
						gameParams.game.size
					),
					column
				];

				const columnMove: Coord2D = [
					row,
					mod(
						column +
							direction * Math.sign(diffColumn) * moveDistance,
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
									direction *
										Math.sign(diffRow) *
										moveDistance +
									Math.sign(diffRow) * -2,
								gameParams.game.size
						  )
						: row,
					ColumnGreater
						? column
						: mod(
								column +
									direction *
										Math.sign(diffColumn) *
										moveDistance +
									Math.sign(diffRow) * -2,
								gameParams.game.size
						  )
				];

				const lateralMoveBlocked = allEntities.some((entity) => {
					if (entity.blocking) {
						return collisionPred(lateralMove, entity.position);
					}

					return false;
				});

				if (!lateralMoveBlocked) {
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
		if (this.gameState.strawberryTime > 0) {
			this.gameState.strawberryTime--;
		}

		if (this.gameState.strawberryTime === 0) {
			this.gameState.reversedEnemies = false;
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
