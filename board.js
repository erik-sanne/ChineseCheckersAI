'use strict';
var STEP = undefined;

function createGameboard(boardHeight) {

	const approxNumHolesInHeight = 15;
	const step = boardHeight / approxNumHolesInHeight;
	const holeSize = 0.85 * 0.5 * step;

	STEP = step;

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
	let graph = makeGraph(holeLocations, step);

	return {
		holeLocations: holeLocations,
		holeSize: holeSize,
		holes: emptyHoles,
		graph: graph
	}
}

function makeGraph(locations, step) {
	let graph = []

	for (let i = 0; i < locations.length; ++i) {
		let p0 = locations[i];
		let iToK = [-1, -1, -1, -1, -1, -1];
		for (let k = 0; k < locations.length; ++k) {
			let p1 = locations[k];
			let dx = p1.x - p0.x;
			let dy = p1.y - p0.y;
			if (Math.abs(Math.sqrt(dx * dx + dy * dy) - step) <= 0.1) {

				// Quanize angles to slots
				const deg30 = Math.PI / 6.0;
				let angle = (Math.atan2(dy, dx) + Math.PI + deg30);
				let quantized = Math.floor(angle / (2.0 * Math.PI) * 6);
				let slot = (quantized == 6) ? 0 : quantized;
				iToK[slot] = k;

			}
		}
		graph.push(iToK);
	}

	return graph;
}

function distanceBetweenHoles(i0, i1, board) {

	let h0 = board.holeLocations[i0];
	let h1 = board.holeLocations[i1];

	let dx = h0.x - h1.x;
	let dy = h0.y - h1.y;

	return Math.sqrt( dx * dx + dy * dy);
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

function calculatePotentialTargets(holes, current) {

	let targets = [];

	if (current == null) {
		return;
	}

	// Recursively add all potential targets that come from jumping over marbles
	recursiveAddJumpTargets(current, holes, targets);

	// If empty hole right next to current
	let neighbors = graph[current];
	for (var dir = 0; dir < neighbors.length; dir++) {

		let neighbor = neighbors[dir];
		let neighborHole = holes[neighbor];

		// Empty hole besides current
		if (neighborHole == 0 && targets.indexOf(neighbor) == -1) {
			targets.push(neighbor);
		}

	}

	return targets;
}

function recursiveAddJumpTargets(reference, holes, targets) {

	let neighbors = graph[reference];
	for (var dir = 0; dir < neighbors.length; dir++) {

		let neighbor = neighbors[dir];
		let neighborHole = holes[neighbor];

		// Filled hole besides current, look if there is an empty one just beyond
		if (neighborHole > 0) {
			let beyond = graph[neighbor][dir];
			if (holes[beyond] == 0) {

				// If it hasn't been considered already...
				if (targets.indexOf(beyond) == -1) {
					targets.push(beyond);
					recursiveAddJumpTargets(beyond, holes, targets);
				}
			}
		}

	}

}
