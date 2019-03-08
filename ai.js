let nodeCount = 0;

function constructStateTree(board, maxDepth){
	nodeCount = 0;

	let root = {
		state : board.holes,
		children : [],
		moves : [],
		score : undefined,
		optimalMove : undefined
	}

	//let tree = iterativelyConstructStateTree(root, maxDepth);
	//assignScoresToNodes(root, board.holeLocations);

	let maxScore = constructPrunedTree(root, maxDepth, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true);
	console.log(nodeCount);
	return root;
}

function iterativelyConstructStateTree(root, maxDepth){

	let queue = new FifoQueue();
	queue.push({node: root, depth: 0});

	while (queue.length() != 0) {
		let current = queue.pop();

		if (current.depth >= maxDepth) {
			continue;
		}

		let winState = true;
		for (let i of [81, 82, 83, 84, 85, 86, 87, 88, 89, 90]) {
			if (current.node.state[i] !== NELLY_MARBLE) {
				winState = false;
			}
		}

		if (winState) {
			console.log('found win state at depth: '+current.depth);
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

//TESTTESTTEST
function constructPrunedTree(node, depth, alpha, beta, maximizing){
	if(depth <= 0){

		let winState = true;
		for (let i of [81, 82, 83, 84, 85, 86, 87, 88, 89, 90]) {
			if (node.state[i] !== NELLY_MARBLE) {
				winState = false;
			}
		}

		if (winState) {
			console.log('found win state at depth: '+depth);
			if(maximizing) {
				return Number.POSITIVE_INFINITY;
			} else {
				return Number.NEGATIVE_INFINITY;
			}
		}

		return evaluateState(node.state, board.holeLocations, [120,90]);
	}

	if(maximizing){
		let value = Number.NEGATIVE_INFINITY;
		let playerIndex = 1;
		let player = playerIndex + 1;

		for(let i = 0; i < node.state.length; i++){
			if(node.state[i] == player){
				for (let target of calculatePotentialTargets(node.state, i)){
					node.moves.push({src: i, dest: target});

					let newState = node.state.slice();
					newState[i] = 0;
					newState[target] = player;

					let childNode = {
						state : newState,
						children : [],
						moves : [],
						score : undefined,
						optimalMove : undefined
					};

					node.children.push(childNode);
					nodeCount++;

					let newVal = constructPrunedTree(childNode, depth-1, alpha, beta, false);
					if (newVal > value) {
						value = newVal;
						node.optimalMove = node.moves[node.moves.length-1];
						node.score = value;
					}
					alpha = Math.max(alpha, value);
/*
					value = Math.max(value, constructPrunedTree(childNode, depth-1, alpha, beta, false));
					//alpha = Math.max(alpha, value);

					if(value > alpha){
						node.optimalMove = node.moves[node.moves.length-1];
						node.score = value;
						alpha = value;
					}
*/
					if(alpha >= beta){
						return value; //No need to continue
					}
				}
			}
		}

		return node.score;

	} else {
		let value = Number.POSITIVE_INFINITY;
		let playerIndex = 0;
		let player = playerIndex + 1;



		for(let i = 0; i < node.state.length; i++){
			if(node.state[i] == player){
				for (let target of calculatePotentialTargets(node.state, i)){
					node.moves.push({src: i, dest: target});

					let newState = node.state.slice();
					newState[i] = 0;
					newState[target] = player;

					let childNode = {
						state : newState,
						children : [],
						moves : [],
						score : undefined,
						optimalMove : undefined
					};

					node.children.push(childNode);
					nodeCount++;

					let newVal = constructPrunedTree(childNode, depth-1, alpha, beta, true);
					if (newVal < value) {
						node.optimalMove = node.moves[node.moves.length-1];
						node.score = newVal;
						value = newVal;
					}
					/*
					value = Math.min(value, constructPrunedTree(childNode, depth-1, alpha, beta, true));

					if(value < beta){
						node.optimalMove = node.moves[node.moves.length-1];
						node.score = value;
						beta = value;
					}
					*/

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

		if ([81, 82, 83, 84, 85, 86, 87, 88, 89, 90].includes(i)) {
			scores[index] -= 100;
		}

	}

	return scores[HUMAN] - scores[NELLY];
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

		// This is needed if all possible future moves makes the state worse, i.e when enetring the last gole hole with only one move...
		// However, I have a suspicion that it might not allways risk pervent if all future is worse than one move. So I would like to check
		// depth > 1 instead to always account for opponent moves, but for some reason we again get problems at end game... Please check into this :)
		if (depth > 0) {
			optScore = evaluateState(current.state, holeLocations, targetIndex);
		}

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
