let nodeCount2 = 0;

var ai2 = {

constructStateTree : function constructStateTree(board, maxDepth, player){
	nodeCount2 = 0;

	let root = {
		state : board.holes,
		children : [],
		moves : [],
		score : undefined,
		optimalMove : undefined
	}

	let tree = ai2.iterativelyConstructStateTree(root, maxDepth, player);
	ai2.assignScoresToNodes(root, board.holeLocations, player);

	return tree;
},

iterativelyConstructStateTree : function iterativelyConstructStateTree(root, maxDepth, playerX){

	let queue = new FifoQueue();
	queue.push({node: root, depth: 0});

	while (queue.length() != 0) {
		let current = queue.pop();

		if (current.depth >= maxDepth) {
			continue;
		}
/*
		let winState = true;
		for (let i of [81, 82, 83, 84, 85, 86, 87, 88, 89, 90]) {
			if (current.node.state[i] !== 2) {
				winState = false;
			}
		}

		if (winState) {
			console.log('found win state at depth: '+current.depth);
			continue;
		} */
		
		let playerIndex = (current.depth + playerX) % 2;
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
					nodeCount2++;

					queue.push({
						node: childNode,
						depth: current.depth + 1
					});
				}
			}
		}

	}

	return root;

},

// Players:
//  index 0 = MIN = human <-- why can index be other values then?
//  index 1 = MAX = computer
// this function gives a score for the given state
evaluateState : function evaluateState(state, holeLocations, targetIndex) {

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

		//If on row 5 or less, base score only on y
		/*
		let abs_dy = Math.abs(dy);
		let threshold = (Math.sqrt(3)/2) * STEP; 
		if (abs_dy <= threshold){
			scores[index] += abs_dy;
			continue;
		}
		*/

		// TODO: If i is a hole that actually is a goal-hole, then the distance should maybe
		// be clamped down to zero, maybe..? Or something similar so we don't "punish" "valid" holes
		let dist = Math.sqrt(dx * dx + dy * dy);

		scores[index] += dist;

		for (let j = 0; j < 10; j++) {
			if (state[targetIndex[index]-j] == marble) {
				scores[index] -= 100;
			}
		}
	}

	
	// (player 1 i.e. computer is MAX)
	//return scores[1] - scores[0];
	return scores[0] - scores[1]; // Correct, score = dist, want as low dist as possible.
								// When maximizing we want larger dist for player 1 to lower score
	
},

assignScoresToNodes : function assignScoresToNodes(root, holeLocations, player) {
	ai2.recAssignScoresToNodes(root, holeLocations, 0, player);
},

recAssignScoresToNodes : function recAssignScoresToNodes(current, holeLocations, depth, player) {

	// TODO: Maybe don't hardcode!
	const targetIndex = [120, 90];

	let maximize = ((depth + player + 1) % 2) == 0;

	let optScore = (maximize) ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
	let optMove = undefined;

	if (current.children.length == 0) {
		current.score = ai2.evaluateState(current.state, holeLocations, targetIndex, player);
	} else {
		/*
		if (maximize){
			optScore = evaluateState(current.state, holeLocations, targetIndex);
		}
		*/

		for (var i = 0; i < current.children.length; i++) {
			let child = current.children[i];
			ai2.recAssignScoresToNodes(child, holeLocations, depth + 1)
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
}