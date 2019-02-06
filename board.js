'use strict';

function createGameboard(boardHeight) {

	const approxNumHolesInHeight = 15;
	const step = boardHeight / approxNumHolesInHeight;
	const holeSize = 0.85 * 0.5 * step;

	let t1 = createTriangle(step);
	let t2 = createTriangle(step);

	for (let i = 0; i < t2.length; i++){
		let srcX = t2[i].x;
		let srcY = t2[i].y;

		t2[i].x = srcX * Math.cos(Math.PI) - srcY * Math.sin(Math.PI);
		t2[i].y = srcY * Math.cos(Math.PI) + srcX * Math.sin(Math.PI);
	}

	let holeLocations = t1;
	const threshold = .5;
	for (let i = 0; i < t2.length; i++){
		if (!distanceLowerThanThreshold(t2[i].x, t2[i].y, holeLocations, threshold))
			holeLocations.push(t2[i]);
	}

	let emptyHoles = new Array(holeLocations.length).fill(0);

	return {
		holeLocations: holeLocations,
		holeSize: holeSize,
		holes: emptyHoles
	}
}

function distanceLowerThanThreshold(x1, y1, board, threshold){
	for (let i = 0; i < board.length; i++){
		let dx = x1 - board[i].x;
		let dy = y1 - board[i].y;
		if (Math.sqrt( dx * dx + dy * dy) < threshold)
			return true;
	}
	return false;
}

function createTriangle(step){
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
