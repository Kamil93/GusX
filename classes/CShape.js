CShape = function(object, type, name, x, y) {
	this.object = object;
	this.type = type;
	this.name = name;
	this.x = x;
	this.y = y;
	this.gfx = null;
}

CShape.prototype.getWorldPosition = function() {
	return {
		x: this.getWorldPositionX(),
		y: this.getWorldPositionY()
	};
}

CShape.prototype.getWorldPositionX = function() {
	return this.object.position.x + this.x;
}

CShape.prototype.getWorldPositionY = function() {
	return this.object.position.y + this.y;
}

CShape.prototype.getWorldTestPositionX = function(posx) {
	return posx + this.x;
}

CShape.prototype.getWorldTestPositionY = function(posy) {
	return posy + this.y;
}

CShape.prototype.getAABB = function() {
	return [0, 0, 0, 0];
}

CShape.prototype.onDestroy = function() {
	
}