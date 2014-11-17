CNinjaRope = function CNinjaRope(map, definition) {
	CObject.call(this, map, definition);
	
	//-------------------------------------------
	
	this.NOT_ATTACHED = 0;
	this.TO_MATERIAL = 1;
	this.TO_OBJECT = 2;
	
	//-------------------------------------------
	
	this.ownerObj = null;
	
	this.mainShape = this.getShape("main");
	this.attached = this.NOT_ATTACHED;
	
	this.minLength = 50;
	this.maxLength = 400;
	this.pullForce = 800;
	
	this.lineGfx = null;
}

CNinjaRope.prototype = new CObject();

CNinjaRope.prototype.serializeForCreateSync = function() {
	return false;
}

CNinjaRope.prototype.update = function() {
	CObject.prototype.update.call(this);
	
	if ( this.map.game.gusx.isBrowser() && this.ownerObj !== null ) {
		if ( this.lineGfx !== null ) this.lineGfx.parent.removeChild(this.lineGfx);

		this.lineGfx = this.map.game.tools.generateLine(
			this.position.x,
			this.position.y, 
			this.ownerObj.position.x-this.position.x+this.ownerObj.mainShape.x+this.ownerObj.mainShape.w/2,
			this.ownerObj.position.y-this.position.y+this.ownerObj.mainShape.y+this.ownerObj.mainShape.h/2,
			0xDC8C00, 2, 1
		);

		this.map.gfx.addChildToLayer(0, this.lineGfx);
	}
}

CNinjaRope.prototype.afterPhysicStep = function() {
	CObject.prototype.afterPhysicStep.call(this);
	
	if ( this.ownerObj !== null ) {
		var diff = {
			x: this.position.x - (this.ownerObj.position.x+this.ownerObj.mainShape.x+this.ownerObj.mainShape.w/2),
			y: this.position.y - (this.ownerObj.position.y+this.ownerObj.mainShape.y+this.ownerObj.mainShape.h/2)
		};
		var curLen = this.map.game.tools.lineDistance(0, 0, diff.x, diff.y);

		var force = {
			x: diff.x * this.pullForce,
			y: diff.y * this.pullForce
		};
		
		if ( this.attached != this.NOT_ATTACHED ) {
			if ( curLen > this.minLength ) {
				this.ownerObj.transportVelocity.x += (force.x / curLen) * this.map.DT_SEC;
				this.ownerObj.transportVelocity.y += (force.y / curLen) * this.map.DT_SEC;
			}
		}
		else {
			if ( curLen > this.minLength ) {
				this.velocity.x -= (force.x / curLen) * this.map.DT_SEC;
				this.velocity.y -= (force.y / curLen) * this.map.DT_SEC;
			}
		}
	}
}

CNinjaRope.prototype.onCollision = function(col) {
	CObject.prototype.onCollision.call(this, col);
	
	if ( col.shape.type == "particle_sensor" && col.shape.name == "hook" ) {
		this.setPositionX(col.colpos.x);
		this.setPositionY(col.colpos.y);
		
		this.velocity.x = 0;
		this.velocity.y = 0;
	
		this.update();
		this.body.type = this.STATIC;
		
		this.attached = this.TO_MATERIAL;
	}
}

CNinjaRope.prototype.onDestroy = function() {
	CObject.prototype.onDestroy.call(this);
	
	if ( this.lineGfx !== null ) this.lineGfx.parent.removeChild(this.lineGfx);
}