var ctx;

let board;
let gameState;

let currentlySelected = null;
let potentialTargets = [];

let currentPlayer = 0;
let playerCount = 2;

let searchTreeDepth = 5;

let playerColors = [
	'#3C7BE2', // blue
	'#F8786D'  // red
];

const HUMAN = 0;
const NELLY = 1;


function initializeGame() {

	let canvas = document.getElementById('canvas');
	canvas.addEventListener('click', function (e) { onBoardClicked(e); });
	ctx = canvas.getContext('2d');

	board = new DefaultBoard({x: canvas.width, y: canvas.height});
	gameState = board.createInitialState(playerCount);

	drawCurrentBoardState();
}

function onBoardClicked(e) {

	var rect = e.target.getBoundingClientRect();
	var x = e.clientX - rect.left;
	var y = e.clientY - rect.top;

	for (let i = 0; i < board.holeLocations.length; i++){

		let pos = board.holeLocations[i];
		let dx = x - pos.x;
		let dy = y - pos.y;

		if (Math.sqrt(dx * dx + dy * dy) < board.holeSize) {
			selectHole(i);
			return;
		}
	}
}

function selectHole(index) {

	//console.log(index);
	//console.log(board.holeLocations[index]);

	let ownerOfSelected = GameBoard.playerForMarble(gameState[index]);

	if (currentlySelected == index) {

		// Unselecting currently selected
		currentlySelected = null;
		potentialTargets = [];

	} else if (ownerOfSelected == currentPlayer) {

		// Selecting first marble (must be owned by the current player)
		currentlySelected = index;
		potentialTargets = board.getPotentialTargets(gameState, currentlySelected);

	} else {

		let targetIndex = potentialTargets.indexOf(index);
		if (targetIndex != -1) {

			// Clicking on a valid target
			GameBoard.moveMarble(gameState, currentlySelected, index);
			onMarbleMoved();

			currentlySelected = null;
			potentialTargets = [];
		}

	}

	drawCurrentBoardState();
}

function onMarbleMoved() {

	if (board.playerHasAllMarblesInGoal(gameState, currentPlayer)) {
		drawCurrentBoardState();
		let msg = "Congratulations, you won!";
		if (currentPlayer == NELLY)
			msg = "You lost!";
		msg+="\nRematch?";
		let rematch = confirm(msg);

		if (rematch)
			location.reload();

		return;
	}

	nextPlayer();
}

function checkWinConditionForCurrentPlayer(state) {

	for (holeIndex of board.goalHolesForPlayer(currentPlayer)) {
		if (state[holeIndex] != GameBoard.marbleForPlayer(currentPlayer)) {
			return false;
		}
	}

	return true;

}

function nextPlayer() {
	currentPlayer = (currentPlayer + 1) % playerCount;

	if (currentPlayer == NELLY) {
		setTimeout(function() {
			performAImove();
		}, 100);
	}
}

function performAImove() {

	let start = new Date().getTime();
	let treeRoot = constructStateTree(gameState, board, searchTreeDepth);
	let delta = new Date().getTime() - start;

	console.log('AI move took ' + delta + 'ms');

	let move = treeRoot.optimalMove;
	GameBoard.moveMarble(gameState, move.src, move.dest);
	onMarbleMoved();

	drawCurrentBoardState();

}

function colorForPlayer(playerIndex) {
	return playerColors[playerIndex];
}

function makeMarbleCirclePath(x, y, size) {
	ctx.beginPath();
	let radius = (size) ? size : board.holeSize;
	ctx.arc(x, y, radius, 0, Math.PI * 2.0, false);
	ctx.closePath();
}

function drawCurrentBoardState() {

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw current player indicator
	let size = 50;
	makeMarbleCirclePath(size, size, size);
	ctx.fillStyle = colorForPlayer(currentPlayer);
	ctx.fill();

	// Draw the graph (as a nice grid in the background)
	ctx.strokeStyle = "#999";
	ctx.lineWidth = 2;
	for (let i = 0; i < board.graph.length; i++) {
		let p0 = board.holeLocations[i];
		let connections =  board.graph[i];
		for (let k = 0; k < connections.length; ++k) {
			if (connections[k] == -1) {
				// -1 indicates no edge, so ignore it
				continue;
			}
			let p1 = board.holeLocations[connections[k]];
			ctx.beginPath();
			ctx.moveTo(p0.x, p0.y);
			ctx.lineTo(p1.x, p1.y);
			ctx.closePath();
			ctx.stroke();
		}
	}

	for (let i = 0; i < board.holeLocations.length; i++){

		let point = board.holeLocations[i]
		let x = point.x;
		let y = point.y;

		let state = gameState[i];

		if (state == 0) {

			// No marbles in this hole
			makeMarbleCirclePath(x, y);
			ctx.fillStyle = "#ddcccf";
			ctx.fill();

		}
		else {

			// Marble for some player in this hole
			let player = GameBoard.playerForMarble(state);
			ctx.fillStyle = colorForPlayer(player);
			makeMarbleCirclePath(x, y);
			ctx.fill();

		}

		// Draw player target hole indicators
		for (let j = 0; j < playerCount; j++){
			if (state == 0 && board.goalHolesForPlayer(j).includes(i)) {
				makeMarbleCirclePath(x, y, 4.0 / 5.0 * board.holeSize);
				ctx.strokeStyle = colorForPlayer(j);
				ctx.lineWidth = 1;
				ctx.stroke();
				break;
			}
		}

		// Draw the currently selected hole
		if (i == currentlySelected) {
			makeMarbleCirclePath(x, y);
			ctx.lineWidth = 4;
			ctx.strokeStyle = "#FFFF99";
			ctx.stroke();
		}

		// Draw the potential targets
		if (potentialTargets.includes(i)) {
			makeMarbleCirclePath(x, y);
			ctx.lineWidth = 4;
			ctx.strokeStyle = "#FFFFFF";
			ctx.stroke();
		}
	}

}

initializeGame();
