import _ from "lodash";
import { getRandomInt, mod } from "./utils";
import gameConfig from "./config.json";
import { GameGrid } from "./game";

// set config & state

type GameParams = typeof gameConfig;

const gameParams: GameParams = _.cloneDeep(gameConfig);

// function updateInput(element: HTMLInputElement, gameParam: keyof GameParams) {
// 	element.addEventListener("input", () => {
// 		gameParams[gameParam] = Number(element.value);
// 		resetGame();
// 	});
// }

const gameGridElement = document.querySelector("#game-grid") as HTMLElement;
const scoreDisplayElement = document.querySelector("#score") as HTMLElement;
// const noPlayersInput = document.querySelector("#noPlayers") as HTMLInputElement;
// const noEnemiesInput = document.querySelector("#noEnemies") as HTMLInputElement;
// const defaultDelayInput = document.querySelector(
// 	"#defaultDelay"
// ) as HTMLInputElement;

// init player controls
const directionActions = {
	left: (player: Player) => {
		const [rows, column] = player.position;
		player.position = [rows, mod(column - 1, gameParams.size)];
		checkIfScored(player);
	},
	right: (player: Player) => {
		const [rows, column] = player.position;
		player.position = [rows, mod(column + 1, gameParams.size)];
		checkIfScored(player);
	},
	up: (player: Player) => {
		const [rows, column] = player.position;
		player.position = [mod(rows - 1, gameParams.size), column];
		checkIfScored(player);
	},
	down: (player: Player) => {
		const [rows, column] = player.position;
		player.position = [mod(rows + 1, gameParams.size), column];
		checkIfScored(player);
	}
};

// make sure players have movement controls attached

function checkIfScored(player: Player) {
	for (const [index, coin] of gameState.coins.entries()) {
		if (collisionPred(player, coin)) {
			applyEntityColor(coinColor, [coin]);
			// remove the coin
			gameState.coins.splice(index, 1);
			// add new coin
			const newCoins = generateEntities(
				1,
				[collisionPred],
				gameState.allEntities
			);
			gameState.coins.push(...newCoins);
			applyEntityColor(coinColor, newCoins);
			gameState.score++;
			displayScore();
		}
	}
}

// register the last key pressed during the animation frame
document.addEventListener("keydown", (event) => {
	const playerIndex = gameState.controlPlayerMap[event.key];
	gameStarted = true;
	if (typeof playerIndex == "number") {
		const player = gameState.players[playerIndex];
		player.controls.lastKeyPressed = event.key;
	}
});

// move the player with arrow keys
const gameGrid = new GameGrid(
	gameGridElement,
	scoreDisplayElement,
	gameParams.game.size
);

gameGrid.init();
gameGrid.gameLoop();
