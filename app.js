var ctx;

var board;
var currentlySelected = null;
var potentialTargets = [];

var currentPlayer = 0;
var currentPlayerCount = 2;

var players = [
	{
		color: '#3C7BE2',
		name: 'Blue',
		startHoles: [81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
		goalHoles: [120, 119, 118, 117, 116, 115, 114, 113, 112, 111]
	},
	{
		color: '#F8786D',
		name: 'Red',
		startHoles: [120, 119, 118, 117, 116, 115, 114, 113, 112, 111],
		goalHoles: [81, 82, 83, 84, 85, 86, 87, 88, 89, 90]
	}
]

function init() {

	let canvas = document.getElementById('canvas');
	canvas.addEventListener('click', function (e) { onBoardClicked(e); });
	ctx = canvas.getContext('2d');

	board = createGameboard(canvas.height);
	fillInInitialPlayerMarbles();
	drawCurrentBoardState(board);

	var iterationCount = 0;
	do {
		constructStateGraph(board);
		iterationCount++;
		console.log(iterationCount);
	}
	while(iterationCount < 3.53e+22);

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

	let ownerOfSelected = board.holes[index] - 1;

	if (currentlySelected == index) {

		// Unselecting currently selected
		currentlySelected = null;

	} else if (ownerOfSelected == currentPlayer) {

		// Selecting first marble (must be owned by the current player)
		currentlySelected = index;

	} else {

		let targetIndex = potentialTargets.indexOf(index);
		if (targetIndex != -1) {

			// Clicking on a valid target
			let marble = board.holes[currentlySelected];
			board.holes[currentlySelected] = 0;
			board.holes[index] = marble;

			if (checkWinConditionForCurrentPlayer()) {
				drawCurrentBoardState(board);
				alert(players[currentPlayer].name + ' won!'); // TODO: Show in a more *golden* way
			} else {
				nextPlayer();
			}

			currentlySelected = null;

		}

	}

	calculatePotentialTargets(currentlySelected);
	drawCurrentBoardState(board);

}

function checkWinConditionForCurrentPlayer() {

	let player = players[currentPlayer];
	let playerMarble = currentPlayer + 1;

	for (holeIndex of player.goalHoles) {
		if (board.holes[holeIndex] != playerMarble) {
			return false;
		}
	}

	return true;

}

function calculatePotentialTargets(current) {

	potentialTargets = [];
	canRepeatAfterMoveToTarget = [];

	if (current == null) {
		return;
	}

	// Recursively add all potential targets that come from jumping over marbles
	recursiveAddJumpTargets(current);

	// If empty hole right next to current
	let neighbors = board.graph[current];
	for (var dir = 0; dir < neighbors.length; dir++) {

		let neighbor = neighbors[dir];
		let neighborHole = board.holes[neighbor];

		// Empty hole besides current
		if (neighborHole == 0 && potentialTargets.indexOf(neighbor) == -1) {
			potentialTargets.push(neighbor);
		}

	}
}

function recursiveAddJumpTargets(reference) {

	let neighbors = board.graph[reference];
	for (var dir = 0; dir < neighbors.length; dir++) {

		let neighbor = neighbors[dir];
		let neighborHole = board.holes[neighbor];

		// Filled hole besides current, look if there is an empty one just beyond
		if (neighborHole > 0) {
			let beyond = board.graph[neighbor][dir];
			if (board.holes[beyond] == 0) {

				// If it hasn't been considered already...
				if (potentialTargets.indexOf(beyond) == -1) {
					potentialTargets.push(beyond);
					recursiveAddJumpTargets(beyond);
				}
			}
		}

	}

}

function nextPlayer() {
	currentPlayer = (currentPlayer + 1) % currentPlayerCount;
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

function constructStateGraph(board){
	do {
		var currentHole = Math.floor(Math.random()*121);
	}
	while(board.holes[currentHole] == 0);

	calculatePotentialTargets(currentHole);

	var nextMoveIndex = Math.floor(Math.random()*potentialTargets.length);
	var nextMove = potentialTargets[nextMoveIndex];

	let marble = board.holes[currentHole];
	board.holes[nextMove] = marble;
	board.holes[currentHole] = 0;
}

init();