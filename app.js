var ctx;

var board;
var currentlySelected = null;

function init() {

	let canvas = document.getElementById('canvas');
	canvas.addEventListener('click', function (e) { onBoardClicked(e); });

	ctx = canvas.getContext("2d");

	board = createGameboard(canvas.height);
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
			drawCurrentBoardState(board);
			return;
		}
	}
}

function drawCurrentBoardState(board) {

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	let centerX = canvas.width / 2.0;
	let centerY = canvas.height / 2.0;

	for (let i = 0; i < board.holeLocations.length; i++){

		let point = board.holeLocations[i]
		let x = point.x + centerX;
		let y = point.y + centerY;

		let state = board.holes[i];

		if (state == 0) {
			ctx.beginPath();
			ctx.arc(x, y, board.holeSize, 0, Math.PI * 2.0, false);
			ctx.closePath();

			ctx.fillStyle="#ddcccf";
			ctx.fill();
		}

		if (i == currentlySelected) {
			ctx.beginPath();
			ctx.arc(x, y, board.holeSize, 0, Math.PI * 2.0, false);
			ctx.closePath();

			ctx.lineWidth = 4;
			ctx.strokeStyle = "#FF3F40";
			ctx.stroke();
		}
	}

}

init();