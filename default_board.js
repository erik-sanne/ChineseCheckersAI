'use strict';

// The default star shaped chinese checkers board.
class DefaultBoard extends GameBoard {

	constructor(pixelHeight) {

		// Adjust sizes to fit the board in the given height
		const approxNumHolesInHeight = 15;
		let step = pixelHeight / approxNumHolesInHeight;
		let holeSize = 0.85 * 0.5 * step;

		super(step, holeSize);

	}

	// Returns a list of indices for the start location holes for a player p. For now max 2 players are supported
	startHolesForPlayer(p) {

		console.assert(p >= 0 && p < 2);

		const starts = [
			[81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
			[120, 119, 118, 117, 116, 115, 114, 113, 112, 111],
		];

		const debugStarts = [
			[1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			[77, 82, 83, 78, 85, 86, 87, 88, 89, 90]
		];

		return starts[p];

	}

	// Returns a list of indices for the goal location holes for a player p. For now max 2 players are supported
	goalHolesForPlayer(p) {

		console.assert(p >= 0 && p < 2);

		const goals = [
			[120, 119, 118, 117, 116, 115, 114, 113, 112, 111],
			[81, 82, 83, 84, 85, 86, 87, 88, 89, 90]
		]

		return goals[p];

	}

	// Returns a single index for a hole that is a target location for a player p. This could for example be used
	// as a target to optimize the distance of marbles to, such as when evaluating a state for minimax.
	targetLocationIndexForPlayer(p) {

		console.assert(p >= 0 && p < 2);

		// Indices of the tips of the triangles where each player needs to get to
		const targets = [120, 90];

		return targets[p];

	}

	///////////////////////////////////////
	// Hole location creation stuff below

	_createHoleLocations(step) {

		// Default star can be seen as two overlayed triangles, one rotated 180 degrees
		let t1 = this._createTriangle(step);

		// Create rotated copy
		let t2 = [];
		for (let pos of t1) {
			t2.push({
				x: pos.x * Math.cos(Math.PI) - pos.y * Math.sin(Math.PI),
				y: pos.y * Math.cos(Math.PI) + pos.x * Math.sin(Math.PI)
			});
		}

		// Add non-overlapping holes from t2 to the list of locations/holes
		const overlapThreshold = 0.5;

		let locations = t1;
		for (let pos of t2) {
			if (this._canAddPositionToBoard(pos, locations, overlapThreshold)) {
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
