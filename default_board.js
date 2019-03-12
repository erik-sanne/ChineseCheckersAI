'use strict';

class DefaultBoard extends GameBoard {

	constructor(pixelHeight) {

		// Adjust sizes to fit the board in the given height
		const approxNumHolesInHeight = 15;
		let step = pixelHeight / approxNumHolesInHeight;
		let holeSize = 0.85 * 0.5 * step;

		super(step, holeSize);

	}

	startHolesForPlayer(i) {

		const starts = [
			[81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
			[120, 119, 118, 117, 116, 115, 114, 113, 112, 111],
		];

		const debugStarts = [
			[1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			[77, 82, 83, 78, 85, 86, 87, 88, 89, 90]
		];

		return starts[i];

	}

	goalHolesForPlayer(i) {

		const goals = [
			[120, 119, 118, 117, 116, 115, 114, 113, 112, 111],
			[81, 82, 83, 84, 85, 86, 87, 88, 89, 90]
		]

		return goals[i];

	}

	// Hole location creation stuff

	_createHoleLocations(step) {

		// Default star can be seen as two overlayed triangles, one rotated 180 degrees...
		let t1 = createTriangle(step);

		// Create rotated copy
		let t2 = [];
		for (let pos of t1) {
			t2.push({
				x: pos.x * Math.cos(Math.PI) - pos.y * Math.sin(Math.PI),
				y: pos.y * Math.cos(Math.PI) + pos.x * Math.sin(Math.PI)
			});
		}

		// Add non-overlapping holes from t2 to the list of locations/holes
		const threshold = 0.5;

		let locations = t1;
		for (let pos of t2) {
			if (this._canAddPositionToBoard(pos, locations, threshold)) {
				locations.push(pos);
			}
		}

		return locations;
	}

	_canAddPositionToBoard(pos, board, threshold){
		for (let i = 0; i < board.length; i++){
			let dx = pos.x - board[i].x;
			let dy = pos.y - board[i].y;
			if (Math.sqrt(dx * dx + dy * dy) < threshold) {
				return false;
			}
		}
		return true;
	}

	_createTriangle(step) {

		let positions = [];
		let pointer = {x: 0, y:0};
		let rowLength = 13;

		let xSum = 0;
		let ySum = 0;

		while (rowLength > 0){
			for (let i = 0; i < rowLength; i++) {
				positions.push({x: pointer.x, y: pointer.y});
				xSum += pointer.x;
				ySum += pointer.y;
				pointer.x += step;
			}
			pointer.x -= rowLength * step;
			pointer.x += step/2;
			pointer.y += Math.sqrt(3 / 4) * step;
			rowLength -= 1;
		}

		let averageX = xSum / positions.length;
		let averageY = ySum / positions.length;

		for (let i = 0; i < positions.length; i++){
			positions[i].x -= averageX;
			positions[i].y -= averageY;
		}

		return positions;
	}

}