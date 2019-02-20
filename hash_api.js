function Hasher(size) {
	const maxRange = 30;
	const stdSize = 300000;
	let length_ = 0;

	if (size === undefined){
		size = this.size;
	}
		
	map = new Array(size).fill(undefined);

	function length() {
		return length_;
	}

	function hash (state){
		if (state === undefined){
			let debug = 0;
		}

		let hashCode = 1;
		for (let marble of state){
			hashCode = 17 * hashCode + marble;
			hashCode = hashCode & hashCode; //to 32-bit :OOOO
		} 
		return hashCode;
	}

	this.put = function ( state ) {
		let hashCode = hash(state);
		let index = hashCode % map.length;
		let maxRange = 100;

		while (maxRange > 0){
			if (map[index] === undefined){
				map[index] = state;
				length_++;
				return true;
			}

			index++;				
			maxRange--;
		}

		console.log("size:" +map.length);
		console.log("filled:" + length());
		console.assert(false);
		return false;
	}

	this.contains = function (state) {
		let hashCode = hash(state);
		let index = hashCode % map.length;
		let maxRange = 100;
		
		while (maxRange > 0){
			if (map[index] === undefined)
				return false;

			if (map[index] === state)
				return true;

			index+=1;
			maxRange--;
		}
		return false;
	}
}