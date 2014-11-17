CGridTest = function(map, grid) {
	var that = this;
	
	this.map = map;
	
	this.displayContainer = new PIXI.DisplayObjectContainer();
	this.displayContainer.position = {x: 0, y: 0};
	this.map.displayContainer.addChild(this.displayContainer);
	
	//this.generateGrid(grid);
	
	this.map.game.tools.log("Grid test started");
}

CGridTest.prototype.getCollidedCells = function(polygon, cell, collided_cells) {
	for ( var i=0; i<cell.grid.length; i++ ) {
		var sub_cell = cell.grid[i];
		var collision_test = (sub_cell.state == sub_cell.COL || sub_cell.state == sub_cell.BOTH) &&
									this.map.game.tools.isPolygonOverlapRectangle(polygon, sub_cell.x, sub_cell.y, sub_cell.x+sub_cell.size, sub_cell.y+sub_cell.size);
		
		if ( collision_test == true ) {
			if ( sub_cell.state == cell.COL ) collided_cells.push(sub_cell);
			else if ( sub_cell.state == cell.BOTH ) this.getCollidedCells(polygon, sub_cell, collided_cells);
		}
	}
}

CGridTest.prototype.generateGrid = function(grid) {
	var that = this;

	for ( var i=0; i<grid.grid.length; i++ ) {	
		var box = this.map.game.tools.generateRectangle(grid.grid[i].x, grid.grid[i].y, grid.grid[i].size, grid.grid[i].size, 0x666666, 0, 1, 0.25);
		box.setInteractive(true);
		box.hitArea = new PIXI.Rectangle(0, 0, grid.grid[i].size, grid.grid[i].size);
		box.gridObject = grid.grid[i];
		box.mouseover = function(mdata) {
			mdata.target.alpha = 0;
		}
		box.mouseout = function(mdata) {
			mdata.target.alpha = 1;
		}
		box.click = function(mdata) {
			if ( mdata.originalEvent.shiftKey == true ) {
				that.divideCell(mdata.target, mdata.target.gridObject);
			}
			else {
				if ( mdata.target.gridObject.state == 2 ) that.map.game.tools.log("Collision cell");
				else if ( mdata.target.gridObject.state == 1 ) that.map.game.tools.log("Air cell");
				else if ( mdata.target.gridObject.state == 3 ) that.map.game.tools.log("Schrodinger's cell");
				else that.map.game.tools.log("Cell " + mdata.target.gridObject.state);
			}
		}
		this.displayContainer.addChild(box);
	}
}

CGridTest.prototype.divideCell = function(box, grid) {
	if ( grid.grid !== null ) {
		box.parent.removeChild(box);
		this.generateGrid(grid);
	}
}