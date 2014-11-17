CCamera = function(map) {
	this.map = map;

	this.dx = 0;
	this.dy = 0;
	
	this.x = 0;
	this.y = 0;
	
	this.crossBounds = false;
	this.followedObject = null;
	this.followedObjectLastPos = {x: 0, y: 0};
	
	this.frozen = false;
}

CCamera.prototype.translatePosition = function() {
	this.map.gfx.position.x = -this.x;
	this.map.gfx.position.y = -this.y;
}

CCamera.prototype.setPosition = function(x, y) {
	this.dx = x;
	this.dy = y;
}

CCamera.prototype.setFollowedObject = function(object) {
	this.followedObject = object;
	this.x = this.followedObject.position.x;
	this.y = this.followedObject.position.y;
}

CCamera.prototype.update = function() {
	if ( this.frozen ) return;

	var new_pos = {x: this.x, y: this.y};
	
	if ( this.followedObject !== null ) {
		new_pos.x = this.followedObject.position.x - this.map.game.CANVAS_WIDTH/2;
		new_pos.y = this.followedObject.position.y - this.map.game.CANVAS_HEIGHT/2;
	}
	
	if ( this.crossBounds == false ) {
		if ( this.map.width < this.map.game.CANVAS_WIDTH ) {
			new_pos.x = this.map.width / 2 - this.map.game.CANVAS_WIDTH / 2;
		}
		else {
			if ( new_pos.x < 0 ) new_pos.x = 0;
			else if ( new_pos.x+this.map.game.CANVAS_WIDTH > this.map.width ) new_pos.x = this.map.width - this.map.game.CANVAS_WIDTH;
		}
		
		if ( this.map.height < this.map.game.CANVAS_HEIGHT ) {
			new_pos.y = this.map.height / 2 - this.map.game.CANVAS_HEIGHT / 2;
		}
		else {
			if ( new_pos.y < 0 ) new_pos.y = 0;
			else if ( new_pos.y+this.map.game.CANVAS_HEIGHT > this.map.height ) new_pos.y = this.map.height - this.map.game.CANVAS_HEIGHT;
		}
	}
	
	this.setPosition(new_pos.x, new_pos.y);
	
	var speed = 1000;
	if ( this.followedObject !== null && false ) {
		var obj_pos_shift = this.map.game.tools.lineDistance(
			this.followedObjectLastPos.x, this.followedObjectLastPos.y,
			this.followedObject.position.x, this.followedObject.position.y
		);

		if ( obj_pos_shift <= 1 ) speed = 1;
		
		this.followedObjectLastPos.x = this.followedObject.position.x;
		this.followedObjectLastPos.y = this.followedObject.position.y;
	}
	
	if ( this.x < this.dx ) {
		this.x += speed;
		if ( this.x > this.dx ) this.x = this.dx;
	}
	else if ( this.x > this.dx ) {
		this.x -= speed;
		if ( this.x < this.dx ) this.x = this.dx;
	}
	
	if ( this.y < this.dy ) {
		this.y += speed;
		if ( this.y > this.dy ) this.y = this.dy;
	}
	else if ( this.y > this.dy ) {
		this.y -= speed;
		if ( this.y < this.dy ) this.y = this.dy;
	}
	
	this.translatePosition();
}