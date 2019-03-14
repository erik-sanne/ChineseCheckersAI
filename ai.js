'use strict';

///////////////////////////////////////////////////////////////
// Debug stuff for counting nodes and branching factors etc.
let nodeCount = 0;
let rounds = 0;
let branching = 0;
///////////////////////////////////////////////////////////////

function constructStateTree(gameState, board, maxDepth){

	rounds++;

	let root = {
		state : gameState,
		child: undefined,
		score: undefined,
		optimalMove: undefined
	}

	let useAlphaBeta = true;

	if (useAlphaBeta) {

		let alpha = Number.NEGATIVE_INFINITY;
		let beta = Number.POSITIVE_INFINITY;
		let maxScore = alphaBetaTreeSearch(root, board, maxDepth, maxDepth, alpha, beta, true);
		console.log("Average nodes: " + (nodeCount/rounds));
		console.log("Average branching factor: " + (nodeCount/branching));
		return root;

	} else {

		let tree = iterativelyConstructStateTree(root, board, maxDepth);
		assignScoresToNodes(root, board);
		console.log("Average nodes: " + (nodeCount/rounds));
		console.log("Average branching factor: " + (nodeCount/branching));
		return tree;

	}

}

//
// TODO: Need cleanup! A lot of redundant code for min vs. max branch.
//
function alphaBetaTreeSearch(node, board, depth, maxDepth, alpha, beta, maximizing){

	// TODO: Should we penalize the AI if the human/other player is winning also?
	if (board.playerHasAllMarblesInGoal(node.state, NELLY)) {
		// Make sure that win states that can be achieved in a lower amount of moves is rewarded
		// higher than win states found in other branches at higher depth
		const largePositiveReward = 10000;
		return largePositiveReward / (maxDepth - depth);
	}

	if (depth == 0) {
		return evaluateState(node.state, board);
	}

	branching++;

	if(maximizing) {

		var value = Number.NEGATIVE_INFINITY;
		let player = NELLY;
		let marble = GameBoard.marbleForPlayer(player);

		for(let i = 0; i < node.state.length; i++){
			if(node.state[i] == marble){
				for (let target of board.getPotentialTargets(node.state, i)) {

					let lastMove = {src: i, dest: target};

					// Prune moves that move mostly backwards away from the goal. This is not mathematically sound
					// but we have observed that the non-pruned AI never performs backwards moves, so doing this heavily
					// reduces the branching factor of the search tree.
					let goalIndex = board.targetLocationIndexForPlayer(player);
					let earnedDistance = board.holeDistance(i, goalIndex) - board.holeDistance(target, goalIndex);
					if (earnedDistance < -0.5 * board.stepLength) {
						continue;
					}

					// Make copy of the state and perform the move/swap
					let newState = node.state.slice();
					GameBoard.moveMarble(newState, i, target);

					let childNode = {
						state: newState,
						child: undefined,
						score: undefined,
						optimalMove: undefined
					};

					nodeCount++;

					let newVal = alphaBetaTreeSearch(childNode, board, depth - 1, maxDepth, alpha, beta, false);
					if (newVal > value) {
						value = newVal;
						node.optimalMove = lastMove;
						node.child = childNode;
						node.score = value;
					}
					alpha = Math.max(alpha, value);

					if(alpha >= beta){
						return value; //No need to continue
					}
				}
			}
		}

		return node.score;

	} else {

		let value = Number.POSITIVE_INFINITY;
		let player = HUMAN;
		let marble = GameBoard.marbleForPlayer(player);

		for(let i = 0; i < node.state.length; i++){
			if(node.state[i] == marble){
				for (let target of board.getPotentialTargets(node.state, i)) {

					let lastMove = {src: i, dest: target};

					// Prune moves that move mostly backwards away from the goal. This is not mathematically sound
					// but we have observed that the non-pruned AI never performs backwards moves, so doing this heavily
					// reduces the branching factor of the search tree.
					let goalIndex = board.targetLocationIndexForPlayer(player);
					let earnedDistance = board.holeDistance(i, goalIndex) - board.holeDistance(target, goalIndex);
					if (earnedDistance < -0.5 * board.stepLength) {
						continue;
					}

					// Make copy of the state and perform the move/swap
					let newState = node.state.slice();
					GameBoard.moveMarble(newState, i, target);

					let childNode = {
						state: newState,
						child: undefined,
						score: undefined,
						optimalMove: undefined
					};

					nodeCount++;

					let newVal = alphaBetaTreeSearch(childNode, board, depth - 1, maxDepth, alpha, beta, true);
					if (newVal < value) {
						value = newVal;
						node.optimalMove = lastMove;
						node.child = childNode;
						node.score = newVal;
					}
					beta = Math.min(value, beta);

					if(alpha >= beta){
						return value;
					}
				}
			}
		}

		return node.score;
	}

}

// This function gives a score for the given state of a board. To use for evaluating
// states in partially evaluated tree minimax searching.
function evaluateState(gameState, board) {

	let distances = [0.0, 0.0];

	for (let i = 0; i < gameState.length; i++) {

		let marble = gameState[i];
		let player = GameBoard.playerForMarble(marble);

		if (player != HUMAN && player != NELLY) {
			continue;
		}

		let loc = board.holeLocations[i];
		let targetIndex = board.targetLocationIndexForPlayer(player);
		let targetLoc = board.holeLocations[targetIndex];

		let dx = loc.x - targetLoc.x;
		let dy = loc.y - targetLoc.y;

		distances[player] += Math.sqrt(dx * dx + dy * dy);

		// TODO: Maybe some randomness..? Probably not mathematically sound, but could add some 'chaos' to the AI?
		//distances[player] += (Math.random() - 0.5) * 10;

	}

	// As a minimax score/evaluation for a state we take the difference between the distances each player is towards
	// winning. This isn't a truly zero sum or constant sum as both distances will generally decrease as a game plays.
	// However, the maximizing player (NELLY) tries to minimize its own distance, while making sure the minimizing
	// player (HUMAN, i.e. the human player) doesn't decrease its distance. In essence, it works fine.
	let score = distances[HUMAN] - distances[NELLY];

	return score;
}

function iterativelyConstructStateTree(root, board, maxDepth) {

	root.moves = [];
	root.children = [];
	root.score = undefined;

	let queue = new FifoQueue();
	queue.push({node: root, depth: 0});

	while (queue.length() != 0) {
		let current = queue.pop();

		if (current.depth >= maxDepth) {
			continue;
		}

		// Win state here, don't continue along this path!
		if (board.playerHasAllMarblesInGoal(current.node.state, NELLY)) {
			console.log('found win state at depth: ' + current.depth);
			continue;
		}

		branching++;

		let player = (current.depth + 1) % 2;
		let marble = GameBoard.marbleForPlayer(player);

		for(let i = 0; i < current.node.state.length; i++){
			if(current.node.state[i] == marble){
				for (let target of board.getPotentialTargets(current.node.state, i)) {

					current.node.moves.push({src: i, dest: target});

					// Make copy of the state and perform the move/swap
					let newState = current.node.state.slice();
					GameBoard.moveMarble(newState, i, target);

					let childNode = {
						state : newState,
						children : [],
						moves : [],
						score : undefined,
						optimalMove : undefined
					};

					current.node.children.push(childNode);
					nodeCount++;

					queue.push({
						node: childNode,
						depth: current.depth + 1
					});

				}
			}
		}

	}

	return root;

}

function assignScoresToNodes(root, board) {
	recAssignScoresToNodes(root, board, 0);
}

//
// TODO: This needs cleanup! A lot of old unused stuff..
//
function recAssignScoresToNodes(current, board, depth) {

	let maximize = (depth % 2) == 0;

	let optScore = (maximize) ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
	let optMove = undefined;

	if (current.children.length == 0) {

		current.score = evaluateState(current.state, board);

	} else {

		// This is needed if all possible future moves makes the state worse, i.e when enetring the last gole hole with only one move...
		// However, I have a suspicion that it might not allways risk pervent if all future is worse than one move. So I would like to check
		// depth > 1 instead to always account for opponent moves, but for some reason we again get problems at end game... Please check into this :)
		if (depth > 0) {
			optScore = evaluateState(current.state, board);
		}

		for (var i = 0; i < current.children.length; i++) {
			let child = current.children[i];
			recAssignScoresToNodes(child, board, depth + 1)
			if (maximize && child.score > optScore) {
				optScore = child.score;
				optMove = current.moves[i];
			}
			if (!maximize && child.score < optScore) {
				optScore = child.score;
				optMove = current.moves[i];
			}
		}

		current.score = optScore;
		current.optimalMove = optMove;
	}

}
