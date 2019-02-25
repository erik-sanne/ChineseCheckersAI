let nodeCount = 0;

function constructStateTree(board, maxDepth, hasher){
	nodeCount = 0;

	let root = {
		state : board.holes,
		children : [],
		moves : [],
		score : undefined,
		optimalMove : undefined
	}
	hasher.put(root.state);

	let tree = iterativelyConstructStateTree(root, maxDepth, hasher);
	assignScoresToNodes(root, board.holeLocations);

	return tree;
}

function iterativelyConstructStateTree(root, maxDepth, hasher){

	let queue = new FifoQueue();
	queue.push({node: root, depth: 0});

	while (queue.length() != 0) {
		let current = queue.pop();

		if (current.depth >= maxDepth) {
			continue;
		}

		let playerIndex = (current.depth + 1) % 2;
		let player = playerIndex + 1;

		for(let i = 0; i < current.node.state.length; i++){
			if(current.node.state[i] == player){
				for (let target of calculatePotentialTargets(current.node.state, i)){
					current.node.moves.push({src: i, dest: target});

					let newState = current.node.state.slice();
					newState[i] = 0;
					newState[target] = player;

					let childNode = {
						state : newState,
						children : [],
						moves : [],
						score : undefined,
						optimalMove : undefined
					};

					if (!hasher.contains(newState)){
						hasher.put(newState);
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

	}

	return root;

}

// Players:
//  index 0 = MIN = human
//  index 1 = MAX = computer
// this function gives a score for the given state
function evaluateState(state, holeLocations, targetIndex) {

	let scores = [0.0, 0.0];

	for (let i = 0; i < state.length; i++) {

		let marble = state[i];
		let index = marble - 1;

		if (index != 0 && index != 1) {
			continue;
		}

		let loc = holeLocations[i];
		let targetLoc = holeLocations[targetIndex[index]];

		let dx = loc.x - targetLoc.x;
		let dy = loc.y - targetLoc.y;

		// TODO: If i is a hole that actually is a goal-hole, then the distance should maybe
		// be clamped down to zero, maybe..? Or something similar so we don't "punish" "valid" holes
		let dist = Math.sqrt(dx * dx + dy * dy);

		scores[index] += dist;

	}

	// (player 1 i.e. computer is MAX)
	//return scores[1] - scores[0];
	return scores[0] - scores[1]; // TODO: What is correct??!

}

function assignScoresToNodes(root, holeLocations) {
	recAssignScoresToNodes(root, holeLocations, 0);
}

function recAssignScoresToNodes(current, holeLocations, depth) {

	// TODO: Maybe don't hardcode!
	const targetIndex = [120, 90];

	let maximize = (depth % 2) == 0;

	let optScore = (maximize) ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
	let optMove = undefined;

	if (current.children.length == 0) {
		current.score = evaluateState(current.state, holeLocations, targetIndex);
	} else {

		for (var i = 0; i < current.children.length; i++) {
			let child = current.children[i];
			recAssignScoresToNodes(child, holeLocations, depth + 1)
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