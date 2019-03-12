'use strict';

class GameBoard {

	constructor(step, holeSize) {

		this.stepLength = step;
		this.holeSize = holeSize;

		// _createHoleLocations must be implemented by derived class!
		this.holeLocations = this._createHoleLocations(step);
		this.graph = this._constructGraph(this.holeLocations, step);

	}

	static marbleForPlayer(p) {
		// (since zero for a hole means no marble, a one means the first player, i.e. player index zero)
		return p + 1;
	}

	static playerForMarble(x) {
		// (see function marbleForPlayer for reference)
		return x - 1;
	}

	static moveMarble(gameState, src, dst) {
		let marble = gameState[src];
		console.assert(marble != 0);
		gameState[src] = 0;
		gameState[dst] = marble;
	}

	holeDistance(i, j) {

		let h0 = this.holeLocations[i];
		let h1 = this.holeLocations[j];

		let dx = h0.x - h1.x;
		let dy = h0.y - h1.y;

		return Math.sqrt(dx * dx + dy * dy);

	}

	// Creates and returns the initial state that the game plays from. 'Restart' the game by calling this
	// and setting the current state to the returned state.
	createInitialState(playerCount) {

		console.assert(playerCount == 2, 'Only two players supported for now!');

		let state = new Uint8Array(this.holeLocations.length).fill(0);
		for (let p = 0; p < playerCount; ++p) {
			for (let idx of this.startHolesForPlayer(p)) {
				state[idx] = GameBoard.marbleForPlayer(p);
			}
		}

		return state;
	}

	// Given a game state and an index to a hole of origin, returns a list of all indices
	// that the marble in origin can jump to.
	getPotentialTargets(gameState, origin) {

		let targets = [];

		if (origin == null || gameState[origin] == 0) {
			return;
		}

		// Recursively add all potential targets that come from jumping over marbles
		this._recursiveAddJumpTargets(origin, gameState, targets);

		// If empty hole right next to current
		let neighbors = this.graph[origin];
		for (var dir = 0; dir < neighbors.length; dir++) {

			let neighbor = neighbors[dir];
			let neighborHole = gameState[neighbor];

			// Empty hole besides current
			if (neighborHole == 0 && targets.indexOf(neighbor) == -1) {
				targets.push(neighbor);
			}

		}

		return targets;
	}

	_recursiveAddJumpTargets(reference, gameState, targets) {

		let neighbors = this.graph[reference];
		for (var dir = 0; dir < neighbors.length; dir++) {

			let neighbor = neighbors[dir];
			let neighborHole = gameState[neighbor];

			// Filled hole besides current, look if there is an empty one just beyond
			if (neighborHole > 0) {
				let beyond = this.graph[neighbor][dir];
				if (gameState[beyond] == 0) {

					// If it hasn't been considered already...
					if (targets.indexOf(beyond) == -1) {
						targets.push(beyond);
						this._recursiveAddJumpTargets(beyond, gameState, targets);
					}
				}
			}

		}

	}

	_constructGraph(locations, step) {

		// Maps from an index of a hole to a list of neighboring hole indices. Due to the rules of chinese checkers we
		// need a neighbor list of identical size for all holes, even though the neighbor count can differ. The rule in
		// question is the jump-over rule, where we need to search the hole just beyond a neighbor in the same direction.
		// By having a consistent index-direction mapping we can easily and cheaply achieve this. For now we require
		// hexagonal game boards, so the neighbor count is fixed to 6 and the graph construction is simple.
		let graph = [];

		for (let i = 0; i < locations.length; ++i) {

			let iToK = [-1, -1, -1, -1, -1, -1];
			let p0 = locations[i];

			for (let k = 0; k < locations.length; ++k) {

				let p1 = locations[k];
				let dx = p1.x - p0.x;
				let dy = p1.y - p0.y;
				if (Math.abs(Math.sqrt(dx * dx + dy * dy) - step) <= 0.1) {

					// Quantize angles for the index-direction mapping
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


}