var ctx;

var board;
var currentlySelected = null;

var currentPlayer = 0;
var currentPlayerCount = 3;

var players = [
	{
		color: '#1F75FE',
		startHoles: [95, 96, 97, 98, 102, 103, 104, 107, 108, 110],
		goalHoles: [9, 10, 11, 12, 22, 23, 24, 34, 35, 45]
	},
	{
		color: '#29AB87',
		startHoles: [109, 106, 105, 101, 100, 99, 94, 93, 92, 91],
		goalHoles: [0, 1, 2, 3, 13, 14, 15, 25, 26, 36]
	},
	{
		color: '#F8786D',
		startHoles: [120, 119, 118, 117, 116, 115, 114, 113, 112, 111],
		goalHoles: [81, 82, 83, 84, 85, 86, 87, 88, 89, 90]
	}
]

function init() {

	let canvas = document.getElementById('canvas');
	canvas.addEventListener('click', function (e) { onBoardClicked(e); });
	ctx = canvas.getContext('2d');

	// TODO: Remove this! It's only temporary for testing..
	document.addEventListener('keydown', function (e) {
		if (e.keyCode == 13) {
			nextPlayer();
			drawCurrentBoardState(board);
		}
	})

	board = createGameboard(canvas.height);
	fillInInitialPlayerMarbles();
	drawCurrentBoardState(board);

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
			currentlySelected = i;
			console.log(i)
			drawCurrentBoardState(board);
			return;
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

		// Draw the currently selected hole
		if (i == currentlySelected) {
			makeMarbleCirclePath(x, y, board);
			ctx.lineWidth = 4;
			ctx.strokeStyle = "#FF3F40";
			ctx.stroke();
		}
	}

}

init();