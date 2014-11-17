CObject.prototype.collisionDataInit = function() {
	this.MXT_NONE = -1;
	this.MXT_LEFT = 0;
	this.MXT_RIGHT = 1;
	
	this.MYT_NONE = -1;
	this.MYT_TOP = 0;
	this.MYT_BOTTOM = 1;
}

CObject.prototype.checkShapeMaterialCol = function(shape) {
	if ( shape.type == "box" ) return this.checkBoxMaterialCol(shape, false);
	else if ( shape.type == "particle_sensor" ) return this.checkBoxMaterialCol(shape, true);
	return false;
}

CObject.prototype.checkBoxMaterialCol = function(shape, sensor) {
	var that = this;

	var move_x = this.nextPosition.x - this.position.x;
	var move_y = this.nextPosition.y - this.position.y;
	
	if ( move_x == 0 && move_y == 0 ) return false;
	
	var aabb = shape.getAABB(true);
	var isCollidedCells = (this.map.grid.isOutOf(aabb) || this.map.grid.isCollidedCells(aabb, this.map.grid)) == true;

	if ( isCollidedCells && (move_x != 0 || move_y != 0) ) {
		return this.checkBoxMaterialCol_testPixels(shape, sensor);
	}
	
	return false;
}

CObject.prototype.checkBoxMaterialCol_testPixels_testEdge = function(col) {
	if ( Math.abs(this.velocity.x) > Math.abs(this.velocity.y) ) {
		col.coldir.x = 0;
	} else { 
		col.coldir.y = 0;
	}
}

CObject.prototype.checkBoxMaterialCol_testPixels = function(shape, sensor) {
	var that = this;
			
	//oblicz pozostałą część przesunięcia
		var spp_x = this.position.x; //sourcePixelPos
		var spp_y = this.position.y;
		
		var dpp_x = this.nextPosition.x; //destPixelPos
		var dpp_y = this.nextPosition.y;

		var move_x = dpp_x - spp_x;
		var move_y = dpp_y - spp_y;
		if ( move_x == 0 && move_y == 0 ) return {collision: false};
		
		var mxt = this.MXT_NONE;
		if ( move_x < 0 ) mxt = this.MXT_LEFT;
		else if ( move_x > 0 ) mxt = this.MXT_RIGHT;
		
		var myt = this.MYT_NONE;
		if ( move_y < 0 ) myt = this.MYT_TOP;
		else if ( move_y > 0 ) myt = this.MYT_BOTTOM;
		
		spp_x = spp_x|spp_x; //Math.round(spp_x); //spp_x|spp_x;
		spp_y = spp_y|spp_y;
		
		if ( Math.abs(move_x) <= this.map.BRESENHAM_COLERROR && Math.abs((this.nextPosition.x|this.nextPosition.x) - (this.position.x|this.position.x)) == 0 )
			dpp_x = spp_x;
		else {	
			if ( mxt == this.MXT_LEFT || mxt == this.MXT_NONE ) dpp_x = dpp_x|dpp_x;
			else dpp_x = Math.ceil(dpp_x);
		}
		
		if ( Math.abs(move_y) <= this.map.BRESENHAM_COLERROR && Math.abs((this.nextPosition.y|this.nextPosition.y) - (this.position.y|this.position.y)) == 0 )
			dpp_y = spp_y;
		else {
			if ( myt == this.MYT_TOP || myt == this.MYT_NONE ) dpp_y = dpp_y|dpp_y;
			else dpp_y = Math.ceil(dpp_y);
		}
		
		var bp_x = -1; //before point
		var bp_y = -1; //before point
		
		var clip_x = 0;
		var clip_x2 = 0;
		var clip_y = 0;
		var clip_y2 = 0;
		
		if ( mxt != this.MXT_NONE && myt != this.MYT_NONE ) {
			if ( mxt == this.MXT_LEFT ) {
				clip_x = 1;
				clip_x2 = 0;
			}
			else {
				clip_x = 0;
				clip_x2 = 1;
			}
		
			if ( myt == this.MYT_TOP ) {
				clip_y = 1;
				clip_y2 = 0;
			}
			else {
				clip_y = 0;
				clip_y2 = 1;
			}
		}

	//funkcja testująca pixele
		var test_position_fn = function(x, y) {
			var x_col = mxt != that.MXT_NONE && that.map.getMaterialVerticalLineSimpleStateAt(shape.getWorldEdgeTestPosition(x, mxt == that.MXT_LEFT ? 3 : 1), shape.getWorldEdgeTestPosition(y, 0)+clip_y, shape.h-(clip_y+clip_y2)) == that.map.NOT_AIR_PIXEL;
			var y_col = myt != that.MYT_NONE && that.map.getMaterialLineSimpleStateAt(shape.getWorldEdgeTestPosition(x, 3)+clip_x, shape.getWorldEdgeTestPosition(y, myt == that.MYT_TOP ? 0 : 2), shape.w-(clip_x+clip_x2)) == that.map.NOT_AIR_PIXEL;
			var edge_col = mxt != this.MXT_NONE && myt != this.MYT_NONE && that.map.getPixelSimpleStateAt(shape.getWorldEdgeTestPosition(x, mxt == that.MXT_LEFT ? 3 : 1), shape.getWorldEdgeTestPosition(y, myt == that.MYT_TOP ? 0 : 2)) == that.map.NOT_AIR_PIXEL;
			
			if ( x_col || y_col || edge_col ) {
				var data = {
					collision: true,
					object: that, shape: shape,
					coldir: {x: 0, y: 0},
					colpos: sensor ? {x: x, y: y} : {x: bp_x, y: bp_y}
				};
				
				if ( x_col || (!y_col && edge_col) ) {
					if ( mxt == that.MXT_LEFT ) data.coldir.x = -1;
					else if ( mxt == that.MXT_RIGHT ) data.coldir.x = 1;
				}
				if ( y_col || (!x_col && edge_col) ) {
					if ( myt == that.MYT_TOP ) data.coldir.y = -1;
					else if ( myt == that.MYT_BOTTOM ) data.coldir.y = 1;
				}
				
				if ( edge_col && !x_col && !y_col ) {
					that.checkBoxMaterialCol_testPixels_testEdge(data);
				}
				
				return data;
			}
		
			return false;
		}
	
	//pętla testująca pixele
		var result = false;
		
		this.map.game.tools.BresenhamAlgorithm(spp_x, spp_y, dpp_x, dpp_y, function(x, y, first) {
			if ( first ) {
				bp_x = x;
				bp_y = y;
				return false; //jeżeli to pierwszy to kontynuuj od następnego, poniewaz pierwszy z zalozenia jest zawsze niekolizyjny
			}
			
			result = test_position_fn(x, y);
			
			if ( result ) return true; //stop algorithm
			else {
				bp_x = x;
				bp_y = y;
			}
			
			//if ( x > destPixelPos.x || y > destPixelPos.y ) return true; //przypadek gdy algorytm rysuje o piksel za daleko, dafuq
		});
		
		return result;
}