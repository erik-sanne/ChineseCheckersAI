var ctx;

function init(){
	let canvas = document.getElementById('canvas');
	ctx = canvas.getContext("2d");
 	
	ctx.fillStyle = "#F00";
	initGameboard();
}

function initGameboard(){
	let positions = [];
	const height = 13;
	const yOffset = 0.86602540378443864676372317075294;
	for (let i = 0; i < height; i++){
		for (let j = 0; j < i; j++){
			positions.push({x: j - i/2, y: i * yOffset});
			positions.push({x: j - i/2, y: (height - i)* yOffset});
			ctx.fillRect(positions[positions.length-1].x + 50, positions[positions.length-1].y, 1, 1);
			ctx.fillRect(positions[positions.length-2].x + 50, positions[positions.length-2].y, 1, 1);
		}
	}
}

init();