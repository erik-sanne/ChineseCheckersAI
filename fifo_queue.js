function FifoQueue(){
	let head = undefined;
	let tail = undefined;
	let length_ = 0;

	this.push = function(element){
		let node = {
			next: undefined,
			element: element
		}

		if (head !== undefined)
			head.next = node;
		else
			tail = node;

		head = node;
		length_++;
	}

	/**	Peek first element and remove from queue
	*/
	this.pop = function(){
		if (tail === undefined){
			console.log("cant pop empty queue");
			return undefined;
		}	

		let last = tail;

		if (head === tail)
			head = undefined;

		tail = last.next;
		
		length_--;
		return last.element;
	}

	/** Peek first element
	*/
	this.peek = function(){
		if (tail === undefined){
			console.log("cant peek empty queue");
			return undefined;
		}	
		return tail.element;
	}

	this.length = function(){
		return length_;
	}

	this.contains = function(element){
		if (tail === undefined){
			return false;
		}

		let currentNode = tail;
		while (currentNode !== undefined){
			if (currentNode.element == element){
				return true;
			}

			currentNode = currentNode.next;
		}
	}
}