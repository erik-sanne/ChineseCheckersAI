var ctx;

var board;
var graph;

var currentlySelected = null;
var potentialTargets = [];

var currentPlayer = 0;
var currentPlayerCount = 2;

var players = [
	{
		color: '#3C7BE2',
		name: 'Blue',
		//startHoles: [81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
		startHoles: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		goalHoles: [120, 119, 118, 117, 116, 115, 114, 113, 112, 111]
	},
	{
		color: '#F8786D',
		name: 'Red',
		//startHoles: [120, 119, 118, 117, 116, 115, 114, 113, 112, 111],
		startHoles: [77, 82, 83, 78, 85, 86, 87, 88, 89, 90], //Debug
		goalHoles: [81, 82, 83, 84, 85, 86, 87, 88, 89, 90]
	}
]

const HUMAN = 0;
const NELLY = 1;

const HUMAN_MARBLE = 1;
const NELLY_MARBLE = 2;


function init() {

	let canvas = document.getElementById('canvas');
	canvas.addEventListener('click', function (e) { onBoardClicked(e); });
	ctx = canvas.getContext('2d');

	board = createGameboard(canvas.height);
	graph = board.graph;

	fillInInitialPlayerMarbles();
	drawCurrentBoardState(board);

	//let val = evaluateState(board.holes, board.holeLocations, [120, 90]);
	//console.log(val);

	//let hasher = new HashMap(1000000);
	//let debugTree = constructStateTree(board, 4, hasher);
	//console.log(debugTree);
	//console.log("Node count: " + nodeCount);
	//console.log("Root score: " + debugTree.score);
/*
	document.addEventListener('keydown', function (e) {
		if (e.keyCode == 32 && currentPlayer == 1) {

			let hasher = new HashMap(1000000);
			let treeRoot = constructStateTree(board, 4, hasher);
			let move = treeRoot.optimalMove;

			let marble = board.holes[move.src];
			board.holes[move.src] = 0;
			board.holes[move.dest] = marble;

			nextPlayer();
			drawCurrentBoardState(board);

		}
	});
*/
/*
	// NOTE: This is just some debug stuff for visualizing!
	let current = debugTree;
	document.addEventListener('keydown', function (e) {
		if (e.keyCode == 32) {
			board.holes = current.state;
			drawCurrentBoardState(board);
			let randomIndex = Math.floor(Math.random() * current.children.length);
			let randomChild = current.children[randomIndex];
			if (randomChild !== undefined) {
				current = randomChild;
			} else {
				current = constructStateTree(board, 2, hasher);
				console.log('done');
			}
		}
	});
*/

}

function onBoardClicked(e) {

	var rect = e.target.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var y = e.clientY - rect.top;

	// TODO: Fix this thing.. It's because of the centering we currently have with the board.
	x -= canvas.width / 2.0;
	y -= canvas.height / 2.0;

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

	let ownerOfSelected = board.holes[index] - 1;

	if (currentlySelected == index) {

		// Unselecting currently selected
		currentlySelected = null;
		potentialTargets = [];

	} else if (ownerOfSelected == currentPlayer) {

		// Selecting first marble (must be owned by the current player)
		currentlySelected = index;
		potentialTargets = calculatePotentialTargets(board.holes, currentlySelected);

	} else {

		let targetIndex = potentialTargets.indexOf(index);
		if (targetIndex != -1) {

			// Clicking on a valid target
			moveMarble(currentlySelected, index);

			currentlySelected = null;
			potentialTargets = [];
		}

	}
	drawCurrentBoardState(board);
}

function moveMarble(src, dest){
	let marble = board.holes[src];
	board.holes[src] = 0;
	board.holes[dest] = marble;
	onMarbleMoved();
}

function onMarbleMoved(){
	if (checkWinConditionForCurrentPlayer(board.holes)) {
		drawCurrentBoardState(board);
		let msg = "Nelly says: Argh...! Rematch?";
		if (currentPlayer == NELLY)
			msg = "Nelly says: I won! :D";
		alert(msg);

		//alert(players[currentPlayer].name + ' won!'); // TODO: Show in a more *golden* way
		return;
	}

	nextPlayer();
}

function checkWinConditionForCurrentPlayer(holes) {

	let player = players[currentPlayer];
	let playerMarble = currentPlayer + 1;

	for (holeIndex of player.goalHoles) {
		if (holes[holeIndex] != playerMarble) {
			return false;
		}
	}

	return true;

}

function nextPlayer() {
	currentPlayer = (currentPlayer + 1) % currentPlayerCount;

	if (currentPlayer == NELLY) {
		setTimeout(function() {
			performAImove();
		}, 100);
	}
}

function performAImove() {

	let treeRoot = constructStateTree(board, 3);
	let move = treeRoot.optimalMove;

	moveMarble(move.src, move.dest);

	drawCurrentBoardState(board);

}

function fillInInitialPlayerMarbles() {
	let count = Math.min(currentPlayerCount, players.length);
	for (var i = 0; i < count; i++) {
		let player = players[i];
		for (holeIndex of player.startHoles) {
			board.holes[holeIndex] = i + 1
		}
	}
}

function colorForPlayer(playerIndex) {
	return players[playerIndex].color;
}

function makeMarbleCirclePath(x, y, board, size) {
	ctx.beginPath();
	let radius = (size) ? size : board.holeSize;
	ctx.arc(x, y, radius, 0, Math.PI * 2.0, false);
	ctx.closePath();
}

function drawCurrentBoardState(board) {

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	let centerX = canvas.width / 2.0;
	let centerY = canvas.height / 2.0;

	// Draw current player indicator
	let size = 50;
	makeMarbleCirclePath(size, size, board, size);
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
			ctx.moveTo(p0.x + centerX, p0.y + centerY);
			ctx.lineTo(p1.x + centerX, p1.y + centerY);
			ctx.closePath();
			ctx.stroke();
		}
	}

	for (let i = 0; i < board.holeLocations.length; i++){

		let point = board.holeLocations[i]
		let x = point.x + centerX;
		let y = point.y + centerY;

		let state = board.holes[i];

		if (state == 0) {

			// No marbles in this hole
			makeMarbleCirclePath(x, y, board);
			ctx.fillStyle = "#ddcccf";
			ctx.fill();

		}
		else {

			// Marble for some player in this hole
			let player = state - 1;
			ctx.fillStyle = colorForPlayer(player);
			makeMarbleCirclePath(x, y, board);
			ctx.fill();

		}

		for (let j = 0; j < players.length; j++){
			if (players[j].goalHoles.includes(i) && state == 0){
				makeMarbleCirclePath(x, y, board, 4*board.holeSize/5);
				ctx.strokeStyle = players[j].color;
				ctx.lineWidth = 1;
				ctx.stroke();
				break;
			}
		}

		// Draw the currently selected hole
		if (i == currentlySelected) {
			makeMarbleCirclePath(x, y, board);
			ctx.lineWidth = 4;
			ctx.strokeStyle = "#FFFF99";
			ctx.stroke();
		}

		// Draw the potential targets
		if (potentialTargets.indexOf(i) != -1) {
			makeMarbleCirclePath(x, y, board);
			ctx.lineWidth = 4;
			ctx.strokeStyle = "#FFFFFF";
			ctx.stroke();
		}
	}

}

init();
