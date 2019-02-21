function Hasher(size) {
	const maxRange = 30;
	const stdSize = 300000;
	let length_ = 0;

	if (size === undefined){
		size = this.size;
	}

	map = new Array(size).fill(undefined);
	if (Object.seal) {
		Object.seal(map);
	}

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

	function arrayEquals(a, b) {
		if (a.length !== b.length) {
			return false;
		}
		for (var i = 0; i < a.length; i++) {
			if (a[i] !== b[i]) {
				return false;
			}
		}
		return true;
	}

	this.put = function ( state ) {

		//return;

		let hashCode = hash(state);
		let index = hashCode % map.length;
		let maxRange = 100;

		while (maxRange > 0){
			if (map[index] === undefined){
				map[index] = state;
				//console.log(length_ + ": state was added with hash: " + hashCode + " at position " + index + " where original hash index was " + (hashCode % map.length));
				length_++;	
				return true;
			}

			index++;
			maxRange--;
		}

		console.log("size:" +map.length);
		console.log("filled:" + length());
		console.assert(false);
		return;
	}

	this.contains = function (state) {

		//return false;

		let hashCode = hash(state);
		let index = hashCode % map.length;
		let maxRange = 100;

		while (maxRange > 0){
			if (map[index] === undefined) {
				return false;
			}

			if (arrayEquals(map[index], state)) {
				return true;
			}

			index+=1;
			maxRange--;
		}
		return false;
	}
}