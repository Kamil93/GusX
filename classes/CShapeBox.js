CShapeBox = function(object, type, name, x, y, w, h) {
	CShape.call(this, object, type, name, x, y);
	
	this.w = w;
	this.h = h;
	
	this.gfx = null;
}

CShapeBox.prototype = new CShape(); //extend

CShapeBox.prototype.getLocalEdgePosition = function(edge_index) {
	if ( edge_index == 0 ) return this.y;
	else if ( edge_index == 1 ) return this.x + this.w-1;
	else if ( edge_index == 2 ) return this.y + this.h-1;
	else if ( edge_index == 3 ) return this.x;
	
	return -1;
}

CShapeBox.prototype.getWorldEdgePosition = function(edge_index) {
	if ( edge_index == 0 ) return this.getWorldPositionY();
	else if ( edge_index == 1 ) return this.getWorldPositionX() + this.w-1;
	else if ( edge_index == 2 ) return this.getWorldPositionY() + this.h-1;
	else if ( edge_index == 3 ) return this.getWorldPositionX();
	
	return -1;
}

CShapeBox.prototype.getWorldEdgeTestPosition = function(pos, edge_index) {
	if ( edge_index == 0 ) return this.getWorldTestPositionY(pos);
	else if ( edge_index == 1 ) return this.getWorldTestPositionX(pos) + this.w-1;
	else if ( edge_index == 2 ) return this.getWorldTestPositionY(pos) + this.h-1;
	else if ( edge_index == 3 ) return this.getWorldTestPositionX(pos);
	
	return -1;
}

CShapeBox.prototype.translateLeftTopCornerToObjectPosition = function(lt_corner_pos) {
	return {
		x: lt_corner_pos.x - this.x,
		y: lt_corner_pos.y - this.y
	};
}

CShapeBox.prototype.getAABB = function(round) {
	var x1 = this.getWorldEdgePosition(3);
	var y1 = this.getWorldEdgePosition(0);
	var x2 = this.getWorldEdgePosition(1);
	var y2 = this.getWorldEdgePosition(2);
	
	var x3 = this.object.nextPosition.x + this.getLocalEdgePosition(3);
	var y3 = this.object.nextPosition.y + this.getLocalEdgePosition(0);
	var x4 = this.object.nextPosition.x + this.getLocalEdgePosition(1);
	var y4 = this.object.nextPosition.y + this.getLocalEdgePosition(2);
	
	if ( round ) {
		x1 = Math.floor(x1);
		y1 = Math.floor(y1);
		x2 = Math.ceil(x2);
		y2 = Math.ceil(y2);
		x3 = Math.floor(x3);
		y3 = Math.floor(y3);
		x4 = Math.ceil(x4);
		y4 = Math.ceil(y4);
	}
	
	return [
		x1 < x3 ? x1 : x3,
		y1 < y3 ? y1 : y3,
		x2 > x4 ? x2 : x4,
		y2 > y4 ? y2 : y4
	];
}

CShapeBox.prototype.onCreated = function() {
	if ( this.object.map.game.gusx.isBrowser() ) {
		this.gfx = this.object.map.game.tools.generateRectangle(0, 0, this.w, this.h, 0xFFFF00, 0xFFFF00, 0, 0.3);
		this.gfx.visible = true;
		this.object.map.gfx.addChild(this.gfx);
	}
}

CShapeBox.prototype.onDestroy = function() {
	CShape.prototype.onDestroy.call(this);
	
	if ( this.object.map.game.gusx.isBrowser() ) {
		this.gfx.parent.removeChild(this.gfx);
	}
}