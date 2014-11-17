CGrid = function(x, y, map, size, parent) {
	this.MIN_SIZE = 16;
	
	this.NOT_SET = 0;
	this.NO_COL = 1;
	this.COL = 2;
	this.BOTH = 3; //Schrodinger's cell
	
	this.TOP = 2;
	this.BOTTOM = 5;
	this.LEFT = 18;
	this.RIGHT = 24;
	
	//------------------------------------------------------

	this.x = x;
	this.y = y;

	this.parent = parent;
	this.level = (this.parent === null ? 1 : this.parent.level + 1);
	this.size = size;
	this.map = map;
	this.state = this.NOT_SET;
	
	this.grid = null;
	
	//------------------------------------------------------
	if ( this.x < this.map.width && this.y < this.map.height )
		this.defineGrid();
	else
		this.setState(this.COL);
}

CGrid.prototype.defineGrid = function() {
	var new_size = this.size / 2;

	if ( new_size >= this.MIN_SIZE ) {
		this.grid = new Array(4);
		
		this.grid[0] = new CGrid(this.x, this.y, this.map, new_size, this);
		this.grid[1] = new CGrid(this.x + new_size, this.y, this.map, new_size, this);
		this.grid[2] = new CGrid(this.x, this.y + new_size, this.map, new_size, this);
		this.grid[3] = new CGrid(this.x + new_size, this.y + new_size, this.map, new_size, this);
	}
	else {
		var has_no_col = false;
		var has_col = false;
		
		for ( var y=0; y<this.size; y++ ) {
			for ( var x=0; x<this.size; x++ ) {
				var pixel_state = this.map.getPixelSimpleStateAt(this.x+x,this.y+y);
				if ( pixel_state == this.map.AIR_PIXEL ) has_no_col = true;
				else if ( pixel_state == this.map.NOT_AIR_PIXEL ) has_col = true;
			}
		}
		
		if ( has_no_col && has_col ) this.setState(this.COL);
		else if ( !has_no_col && has_col ) this.setState(this.COL);
		else if ( has_no_col && !has_col ) this.setState(this.NO_COL);
		else this.setState(101); //lol
	}
}

CGrid.prototype.setState = function(new_state) {
	if ( this.state == this.NOT_SET ) this.state = new_state;
	else if ( new_state == this.BOTH ) this.state = this.BOTH;
	else if ( this.state == this.NO_COL && new_state == this.COL ) this.state = this.BOTH;
	else if ( this.state == this.COL && new_state == this.NO_COL ) this.state = this.BOTH;
	
	if ( this.parent !== null )
		this.parent.setState(this.state);
}

//tools

CGrid.prototype.isCollidedCells = function(aabb, cell) {
	for ( var i=0; i<cell.grid.length; i++ ) {
		var sub_cell = cell.grid[i];
		var collision_test = (sub_cell.state == sub_cell.COL || sub_cell.state == sub_cell.BOTH) &&
									 this.map.game.tools.isRectInRect(aabb[0], aabb[1], aabb[2], aabb[3], sub_cell.x, sub_cell.y, sub_cell.x+sub_cell.size-1, sub_cell.y+sub_cell.size-1);
		
		if ( collision_test == true ) {
			if ( sub_cell.state == cell.COL ) return true;
			else if ( sub_cell.state == cell.BOTH ) {
				if ( this.isCollidedCells(aabb, sub_cell) == true ) return true;
			}
		}
	}
}

CGrid.prototype.isOutOf = function(aabb) {
	if ( aabb[0] < this.x || aabb[1] < this.y || aabb[2] >= this.x+this.size || aabb[3] >= this.y+this.size ) return true;
	return false;
}