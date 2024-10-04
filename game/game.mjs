import { print, askQuestion } from "./io.mjs"
import { debug, DEBUG_LEVELS } from "./debug.mjs";
import { ANSI } from "./ansi.mjs";
import DICTIONARY from "./language.mjs";
import showSplashScreen from "./splash.mjs";

const GAME_BOARD_SIZE = 3;
const PLAYER_1 = 1;
const PLAYER_2 = -1;
const DRAW_OUTCOME = 2;
const NO_OUTCOME = 0;
const WIN_CONDITION_SUM = 3;
const EMPTY_CELL = 0;

const MENU_CHOICES = {
    START_GAME: 1,
    SHOW_SETTINGS: 2,
    EXIT_GAME: 3,
};

const NO_CHOICE = -1;

let language = DICTIONARY.en;
const LANG_CONFIRM_CHAR = language.CONFIRM[0].toLowerCase();

const LANGUAGE_CHOICES = {
    ENGLISH: 'en',
    NORWEGIAN: 'no',
};

const SETTINGS_CHOICES = {
    CHANGE_LANGUAGE: 1,
    BACK_TO_MENU: 2,
};



const SPLASH_SCREEN_DELAY = 2500;

let gameboard;
let currentPlayer;

clearScreen();
showSplashScreen();
setTimeout(start, SPLASH_SCREEN_DELAY);

async function showSettings() {
    let validChoice = false;

    while (!validChoice) {
        clearScreen();
        print(ANSI.COLOR.YELLOW + "SETTINGS" + ANSI.RESET);
        print(`${SETTINGS_CHOICES.CHANGE_LANGUAGE}. Change Language`);
        print(`${SETTINGS_CHOICES.BACK_TO_MENU}. Back to Menu`);

        const choice = await askQuestion("");

        if (choice == SETTINGS_CHOICES.CHANGE_LANGUAGE) {
            await changeLanguage();
        } else if (choice == SETTINGS_CHOICES.BACK_TO_MENU) {
            validChoice = true;
        }
    }
}

async function changeLanguage() {
    let validChoice = false;

    while (!validChoice) {
        clearScreen();
        print(ANSI.COLOR.YELLOW + "CHOOSE LANGUAGE" + ANSI.RESET);
        print(`1. English (en)`);
        print(`2. Norsk (no)`);

        const languageChoice = await askQuestion("");

        if (languageChoice == '1') {
            language = DICTIONARY.en;
            print("Language changed to English.");
            validChoice = true;
        } else if (languageChoice == '2') {
            language = DICTIONARY.no;
            print("Endret språk til norsk");
            validChoice = true;
        } else {
            print("Invalid choice. Please try again.");
        }
    }

    await askQuestion(language.GO_BACK);
}

async function start() {
    do {
        let chosenAction = NO_CHOICE;
        chosenAction = await showMenu();

        if (chosenAction == MENU_CHOICES.START_GAME) {
            await runGame();
        } else if (chosenAction == MENU_CHOICES.SHOW_SETTINGS) {
            await showSettings();
        } else if (chosenAction == MENU_CHOICES.EXIT_GAME) {
            clearScreen();
            process.exit();
        }
    } while (true);
}


async function runGame() {
    let isPlaying = true;

    while (isPlaying) {
        const isVsComputer = await askForGameMode();
        isPlaying = await playGame(isVsComputer);
    }
}

async function askForGameMode() {
    let validChoice = false;
    let isVsComputer = false;

    while (!validChoice) {
        clearScreen();
        print(ANSI.COLOR.YELLOW + language.CHOOSE_MODE + ANSI.RESET);
        print(language.PVP);
        print(language.PVC);

        const choice = await askQuestion("");

        if (choice === '1') {
            isVsComputer = false;
            validChoice = true;
        } else if (choice === '2') {
            isVsComputer = true;
            validChoice = true;
        } else {
            print("Invalid choice. Please try again.");
        }
    }

    return isVsComputer;
}


async function showMenu() {
    let choice = NO_CHOICE;
    let validChoice = false;

    while (!validChoice) {
        clearScreen();
        print(ANSI.COLOR.YELLOW + language.MENU + ANSI.RESET);
        print(language.MENU_PLAY_GAME);
        print(language.MENU_SETTINGS);
        print(language.MENU_EXIT);

        choice = await askQuestion("");

        if ([MENU_CHOICES.START_GAME, MENU_CHOICES.SHOW_SETTINGS, MENU_CHOICES.EXIT_GAME].includes(Number(choice))) {
            validChoice = true;
        }
    }

    return choice;
}


async function playGame(isVsComputer) {
    let outcome;
    do {
        clearScreen();
        showGameBoardWithCurrentState();
        showHUD();

        let move;
        if (isVsComputer && currentPlayer === PLAYER_2) {
            move = getComputerMove();
        } else {
            move = await getGameMoveFromCurrentPlayer();
        }

        updateGameBoardState(move);
        outcome = evaluateGameState();
        changeCurrentPlayer();
    } while (outcome === NO_OUTCOME);

    showGameSummary(outcome);

    return await askWantToPlayAgain();
}

function getComputerMove() {
    let availableMoves = [];

    for (let row = 0; row < GAME_BOARD_SIZE; row++) {
        for (let col = 0; col < GAME_BOARD_SIZE; col++) {
            if (gameboard[row][col] === EMPTY_CELL) {
                availableMoves.push([row, col]);
            }
        }
    }

    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
}

async function askWantToPlayAgain() {
    let answer = await askQuestion(language.PLAY_AGAIN_QUESTION);
    let playAgain = true;
    if (answer && answer.toLowerCase()[0] !== LANG_CONFIRM_CHAR) {
        playAgain = false;
    }
    return playAgain;
}

function showGameSummary(outcome) {
    clearScreen();
    if (outcome === PLAYER_1 || outcome === PLAYER_2) {
        let winningPlayer = outcome > 0 ? 1 : 2;
        print(language.WINNER_MESSAGE.replace("{player}", winningPlayer));
    } else if (outcome === DRAW_OUTCOME) {
        print(language.DRAW_MESSAGE);
    }
    showGameBoardWithCurrentState();
    print(language.GAME_OVER);
}

function changeCurrentPlayer() {
    currentPlayer *= PLAYER_1 * PLAYER_2;
}

function evaluateGameState() {
    let sum = 0;

    for (let row = 0; row < GAME_BOARD_SIZE; row++) {
        sum = gameboard[row].reduce((a, b) => a + b, EMPTY_CELL);
        if (Math.abs(sum) === WIN_CONDITION_SUM) {
            return sum / WIN_CONDITION_SUM;
        }
    }

    for (let col = 0; col < GAME_BOARD_SIZE; col++) {
        sum = EMPTY_CELL;
        for (let row = 0; row < GAME_BOARD_SIZE; row++) {
            sum += gameboard[row][col];
        }
        if (Math.abs(sum) === WIN_CONDITION_SUM) {
            return sum / WIN_CONDITION_SUM; 
        }
    }

    sum = EMPTY_CELL;
    for (let i = 0; i < GAME_BOARD_SIZE; i++) {
        sum += gameboard[i][i];
    }
    if (Math.abs(sum) === WIN_CONDITION_SUM) {
        return sum / WIN_CONDITION_SUM;
    }

    sum = EMPTY_CELL;
    for (let i = 0; i < GAME_BOARD_SIZE; i++) {
        sum += gameboard[i][GAME_BOARD_SIZE - 1 - i];
    }
    if (Math.abs(sum) === WIN_CONDITION_SUM) {
        return sum / WIN_CONDITION_SUM;
    }

    let isDraw = true;
    for (let row = 0; row < GAME_BOARD_SIZE; row++) {
        for (let col = 0; col < GAME_BOARD_SIZE; col++) {
            if (gameboard[row][col] === EMPTY_CELL) {
                isDraw = false;
            }
        }
    }

    return isDraw ? DRAW_OUTCOME : NO_OUTCOME;
}

function updateGameBoardState(move) {
    const ROW_ID = 0;
    const COLUMN_ID = 1;
    gameboard[move[ROW_ID]][move[COLUMN_ID]] = currentPlayer;
}

async function getGameMoveFromCurrentPlayer() {
    let position = null;
    let validMove = false;
    
    do {
        let rawInput = await askQuestion(language.PLACE_MARK_PROMPT);
        position = rawInput.split(" ").map(Number);

        position[0] -= 1;
        position[1] -= 1;

        if (isValidPositionOnBoard(position)) {
            validMove = true;
        } else {
            print(language.INVALID_MOVE);
        }
    } while (!validMove);

    return position;
}

function isValidPositionOnBoard(position) {
    const [row, col] = position;
    
    if (
        position.length === 2 &&
        Number.isInteger(row) &&
        Number.isInteger(col) &&
        row >= 0 && row < GAME_BOARD_SIZE &&
        col >= 0 && col < GAME_BOARD_SIZE &&
        gameboard[row][col] === EMPTY_CELL
    ) {
        return true;
    }
    return false;
}

function showHUD() {
    let playerDescription = currentPlayer === PLAYER_2 ? "2," : "1,";
    print(`${language.PLAYER.replace("{player}", playerDescription)} ${language.PLAYER_TURN}`);
}

function showGameBoardWithCurrentState() {
    for (let currentRow = 0; currentRow < GAME_BOARD_SIZE; currentRow++) {
        let rowOutput = "";
        for (let currentCol = 0; currentCol < GAME_BOARD_SIZE; currentCol++) {
            let cell = gameboard[currentRow][currentCol];
            if (cell === EMPTY_CELL) {
                rowOutput += "_ ";
            } else if (cell === PLAYER_1) {
                rowOutput += ANSI.COLOR.GREEN + "X " + ANSI.RESET;
            } else {
                rowOutput += ANSI.COLOR.RED + "O " + ANSI.RESET;;
            }
        }
        print(rowOutput);
    }
}

function initializeGame() {
    gameboard = createGameBoard();
    currentPlayer = PLAYER_1;
}

function createGameBoard() {
    let newBoard = new Array(GAME_BOARD_SIZE);
    for (let currentRow = 0; currentRow < GAME_BOARD_SIZE; currentRow++) {
        let row = new Array(GAME_BOARD_SIZE);
        for (let currentColumn = 0; currentColumn < GAME_BOARD_SIZE; currentColumn++) {
            row[currentColumn] = EMPTY_CELL;
        }
        newBoard[currentRow] = row;
    }
    return newBoard;
}

function clearScreen() {
    console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME, ANSI.RESET);
}