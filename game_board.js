'use strict';

class GameBoard {

	constructor(step, holeSize) {

		this.stepLength = step;
		this.holeSize = holeSize;

		// _createHoleLocations must be implemented by derived class!
		this.holeLocations = this._createHoleLocations(step);
		this.graph = this._constructGraph(this.holeLocations, step);

	}

	marbleForPlayer(p) {
		// (since zero for a hole means no marble, a one means the first player, i.e. player index zero)
		return p + 1;
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
				state[idx] = this.marbleForPlayer(p);
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