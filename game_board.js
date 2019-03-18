'use strict';

//
// Abstract-style base class for game boards. As of now, any game board with hexagonal tiling of even
// distance can be constructed as a derived class.
//
// It should be noted that there is no mutable state in this class! Calling createInitialState(..)
// generates and returns the game state in which all in-game state mutation occurs. The game itself
// is responsible for mutating this state, but helper functions in this class can be used to simplify
// this process, e.g. moveMarble(..) and checks such as playerHasAllMarblesInGoal(..).
//
class GameBoard {

	// Construct a game board with hole-to-hole distance (step) and hole size/diameter.
	// GameBoard should be considered an 'abstract class' and this constructor should
	// only be called from a derived class that has implemented _createHoleLocations(..),
	// startHolesForPlayer(p) and goalHolesForPlayer(p).
	constructor(canvasSize, step, holeSize) {

		this.canvasSize = canvasSize;
		this.stepLength = step;
		this.holeSize = holeSize;

		this.holeLocations = this._createHoleLocations(step);
		this.graph = this._constructGraph(this.holeLocations, step);

	}

	// Since zero for a hole means no marble, a one means the first player, i.e. player index zero.
	// This function simply maps from a marble to a player.
	static marbleForPlayer(p) {
		return p + 1;
	}

	// The same but opposite version of marbleForPlayer.
	static playerForMarble(x) {
		return x - 1;
	}

	// Modify the given game state with a simple marble swap
	static moveMarble(gameState, src, dst) {
		let marble = gameState[src];
		console.assert(marble != 0);
		gameState[src] = 0;
		gameState[dst] = marble;
	}

	// Return true if all of the marbles of player p in gameState are in the goal holes for player p
	playerHasAllMarblesInGoal(gameState, p) {
		for (let holeIndex of this.goalHolesForPlayer(p)) {
			if (gameState[holeIndex] != GameBoard.marbleForPlayer(p)) {
				return false;
			}
		}

		return true;
	}

	// Returns the euclidian distance between the holes at indices i and j
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

		this._recursiveAddJumpTargets(origin, gameState, targets);

		// If empty hole right next to current
		let neighbors = this.graph[origin];
		for (var dir = 0; dir < neighbors.length; dir++) {

			let neighbor = neighbors[dir];
			let neighborHole = gameState[neighbor];

			// Empty hole besides current
			if (neighborHole == 0 && !targets.includes(neighbor)) {
				targets.push(neighbor);
			}

		}

		return targets;
	}

	// Recursively add all potential targets to the list targets that come from jumping over other marbles.
	// Since jumping can be repeated (and we clump together all repeated jumps), this recursively finds all
	// targets that can be jumped to.
	_recursiveAddJumpTargets(reference, gameState, targets) {

		let neighbors = this.graph[reference];
		for (var dir = 0; dir < neighbors.length; dir++) {

			let neighbor = neighbors[dir];
			let neighborHole = gameState[neighbor];

			// Filled hole besides current, look if there is an empty one just beyond
			if (neighborHole > 0) {
				let beyond = this.graph[neighbor][dir];
				if (gameState[beyond] == 0) {

					if (!targets.includes(beyond)) {
						targets.push(beyond);
						this._recursiveAddJumpTargets(beyond, gameState, targets);
					}
				}
			}

		}

	}

	// Constructs a graph over the holes on the game board. The structure of the graph is as follows:
	//
	// Maps from an index of a hole to a list of neighboring hole indices. Due to the rules of chinese checkers we
	// need a neighbor list of identical size for all holes, even though the neighbor count can differ. The rule in
	// question is the jump-over rule, where we need to search the hole just beyond a neighbor in the same direction.
	// By having a consistent index-direction mapping we can easily and cheaply achieve this. For now we require
	// hexagonal game boards, so the neighbor count is fixed to 6 and the graph construction is simple.
	_constructGraph(locations, step) {

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
