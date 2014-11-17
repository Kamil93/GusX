CPlayer = function CPlayer(map, definition) {
	this.chGfx = null;
	this.chGfxLocalPosition = {x:0, y:0};

	CObject.call(this, map, definition);
	
	//---------------------------------------------

	this.mainShape = this.getShape("main");
	
	this.ninjaRopeObj = null;
	
	this.direction = 1;
	
	this.angle = 0;
	this.angleSpeed = 0;
	this.angleSpeedFricition = 0.995;
	this.angleAcceleration = 1000;
	this.maxAngleSpeed = 5000;
	
	this.moving = false;
	this.movingMaxSpeed = 125;
	this.movingAcc = 950;
	
	this.climbing = false;
	this.climbingMaxH = 14;
	this.climbingVelocity = {x: 0, y: 0};
	this.climbingSpeed = 65;
	this.climbingASpeed = Math.pow(0.899, this.map.DT);;
	this.smartClimbingAngle = 35;
	this.climbingJumpFactor = 0.1;
	this.climbingSkipVX = false;
	
	this.canJump = false;
	this.canClimbingJump = false;
	this.jumpForce = 165;
	this.maxJumpSpeed = 600;
	
	this.transportVelocity = {x: 0, y: 0};
	
	this.chDistance = 50;
	
	this.actions = {
		"left": false,
		"right": false,
		"up": false,
		"down": false,
		"fire": false,
		"jump": false,
		"change": false
	};
	this.changeAction = false;
	
	//---------------------------------------------
}

CPlayer.prototype = new CObject();

CPlayer.prototype.onDestroy = function() {
	CObject.prototype.onDestroy.call(this);
	
	if ( this.chGfx !== null )
		this.chGfx.parent.removeChild(this.chGfx);
}

CPlayer.prototype.define = function(def) {
	CObject.prototype.define.call(this, def);

	if ( this.map.game.gusx.isBrowser() )
		this.defineReadGfx(def.name, def.crosshairGfx, "chGfx");
}

CPlayer.prototype.setAction = function(name, val) {
	this.actions[name] = (val === true);
}

CPlayer.prototype.getAction = function(name) {
	return this.actions[name] === true;
}

CPlayer.prototype.update = function() {
	CObject.prototype.update.call(this);

	if ( this.moving ) {
		this.gfx.animRange = [1, 3];
		this.gfx.start();
	}
	else {
		this.gfx.stop();
	}
	
	if ( this.chGfx ) {
		var chv = this.map.game.tools.createVector( this.getAngle(), this.chDistance );
	
		this.chGfx.position.x = Math.round(this.position.x + this.chGfx.localX + chv.x);
		this.chGfx.position.y = Math.round(this.position.y + this.chGfx.localY + chv.y);
	}
}

CPlayer.prototype.getVelocityX = function() {
	return ((this.velocity.x - this.climbingSkipVX) + this.climbingVelocity.x);
}

CPlayer.prototype.getVelocityY = function() {
	return (this.velocity.y + this.climbingVelocity.y);
}

CPlayer.prototype.getAngle = function() {
	return this.angle * this.direction;
}

CPlayer.prototype.increaseAngleSpeed = function(val) {
	this.angleSpeed += val;
	
	if ( this.angleSpeed < -this.maxAngleSpeed ) this.angleSpeed = -this.maxAngleSpeed;
	else if ( this.angleSpeed > this.maxAngleSpeed ) this.angleSpeed = this.maxAngleSpeed;
}

CPlayer.prototype.shootNinjaRope = function() {
	var that = this;

	var v = this.map.game.tools.createVector(this.getAngle(), 1000);
	
	this.unhookNinjaRope();

	this.ninjaRopeObj = this.map.createObject(true,
		CNinjaRope,
		"ninjarope.obj",
		this.position.x+this.mainShape.x+this.mainShape.w/2,
		this.position.y+this.mainShape.y+this.mainShape.h/2
	);
	this.ninjaRopeObj.setVelocity(v.x, v.y);
	this.ninjaRopeObj.ownerObj = this;
}

CPlayer.prototype.unhookNinjaRope = function() {
	var that = this;
	
	if ( this.ninjaRopeObj )
		this.ninjaRopeObj.addToRemove();
}

CPlayer.prototype.shootBomb = function(vx, vy) {
	var bomb = this.map.createObject(
		CObject,
		"bomb.obj",
		this.position.x+this.getVelocityX()*this.map.DT_SEC+this.mainShape.x+this.mainShape.w/2,
		this.position.y+this.getVelocityY()*this.map.DT_SEC+this.mainShape.y+this.mainShape.h/2
	);
	bomb.setVelocity(vx+this.getVelocityX(), vy+this.getVelocityY());
	bomb.ownerObj = this;
}

CPlayer.prototype.checkBoxMaterialCol_testPixels_testEdge = function(col) {
	if ( Math.abs(this.climbingVelocity.y) >= 0.1 && this.ninjaRopeObj ) {
		col.coldir.x = 0;
		return;
	}

	if ( Math.abs(this.velocity.x + this.climbingVelocity.x) > Math.abs(this.velocity.y + this.climbingVelocity.y) ) {
		col.coldir.x = 0;
	} else { 
		col.coldir.y = 0;
	}
}

CPlayer.prototype.calculateNextPosition = function() {
	this.nextPosition = {
		x: this.position.x + ((this.velocity.x - this.climbingSkipVX) + this.climbingVelocity.x) * this.map.DT_SEC,
		y: this.position.y + (this.velocity.y + this.climbingVelocity.y) * this.map.DT_SEC
	};
}

CPlayer.prototype.changePositionStep = function() {
	this.position.x += ((this.velocity.x - this.climbingSkipVX) + this.climbingVelocity.x) * this.map.DT_SEC;
	this.position.y += (this.velocity.y + this.climbingVelocity.y) * this.map.DT_SEC;
	
	this.climbingSkipVX = 0;
}

CPlayer.prototype.afterPhysicStep = function() {
	CObject.prototype.afterPhysicStep.call(this);
	
	if ( this.canJump || Math.abs(this.climbingVelocity.y) >= 0.1 ) {
		this.velocity.x *= Math.pow(0.986, this.map.DT);
	}
	
	var airFrictionStep = Math.pow(1, this.map.DT);
	this.velocity.x *= airFrictionStep;
	this.velocity.y *= airFrictionStep;
	
	this.canJump = false;
	this.canClimbingJump = false;
	
	this.ceilTouch = false;
	
	var lineToTest = 1;
	
	for ( var i=0; i<lineToTest; i++ ) {
		if ( this.map.getMaterialLineSimpleStateAt(Math.round(this.mainShape.getWorldEdgePosition(3)), Math.ceil(this.mainShape.getWorldEdgePosition(2))+(i+1), this.mainShape.w) == this.map.NOT_AIR_PIXEL ) {
			this.canJump = true;
			break;
		}
	}
	
	if ( this.climbingVelocity.y <= -1 ) {
		this.canClimbingJump = true;
	}
	
	this.climbingVelocity.x *= this.climbingASpeed;
	this.climbingVelocity.y *= this.climbingASpeed;
	
	//aiming
		this.angle += this.angleSpeed * this.map.DT_SEC;
		
		this.angleSpeed *= Math.pow(this.angleSpeedFricition, this.map.DT);

		if ( this.angle < 0 ) {
			this.angle = 0;
			this.angleSpeed = 0;
		}
		else if ( this.angle > 180 ) {
			this.angle = 180;
			this.angleSpeed = 0;
		}
		
	//transport velocity
		this.velocity.x += this.transportVelocity.x;
		this.velocity.y += this.transportVelocity.y;
		this.transportVelocity.x = this.transportVelocity.y = 0;
		
	//moving
		if ( this.actions["left"] ) {
			this.direction = -1;
			if ( this.map.game.gusx.isBrowser() ) this.gfx.flippedH = true;
			if ( this.velocity.x > -this.movingMaxSpeed )
				this.velocity.x += -this.movingAcc * this.map.DT_SEC;
				
			this.moving = true;
		}
		else if ( this.actions["right"] ) {
			this.direction = 1;
			if ( this.map.game.gusx.isBrowser() ) this.gfx.flippedH = false;
			if ( this.velocity.x < this.movingMaxSpeed )
				this.velocity.x += this.movingAcc * this.map.DT_SEC;
				
			this.moving = true;
		}
		else {
			this.moving = false;
		}
		
	//aiming
		if ( this.actions["up"] ) this.increaseAngleSpeed(-this.angleAcceleration * this.map.DT_SEC);
		else if ( this.actions["down"] ) this.increaseAngleSpeed(this.angleAcceleration * this.map.DT_SEC);
		
	//jumping
		if ( this.actions["jump"] && !this.actions["change"] ) {
			this.unhookNinjaRope();
			
			if ( this.canJump || this.canClimbingJump ) {
				if ( this.velocity.y > 0 ) this.velocity.y = 0;
				
				if ( this.canJump && !this.canClimbingJump )
					this.velocity.y -= this.jumpForce;
				else
					this.velocity.y -= this.jumpForce * this.climbingJumpFactor;
				
				if ( this.velocity.y < -this.jumpMaxSpeed ) 
					this.velocity.y = -this.jumpMaxSpeed;

				this.canJump = false;
				this.canClimbingJump = false;
			}
		}
		
	//ninjarope
		if ( this.map.game.gusx.isHost() && this.actions["change"] && this.changeAction == false ) {
			this.shootNinjaRope();
			this.map.game.gusx.syncShootNinjaRope(this, this.ninjaRopeObj.id);
			this.changeAction = true;
		}
		else if ( this.actions["change"] == false ) this.changeAction = false;
	
	//end up
		this.climbing = false;
}

CPlayer.prototype.testClimbing = function(col) {
	var corner_x = this.mainShape.getWorldEdgePosition(col.coldir.x == 1 ? 1 : 3);
	var corner_y = this.mainShape.getWorldEdgePosition(2);

	if ( col.coldir.x == -1 ) corner_x = corner_x|corner_x;
	else corner_x = Math.ceil(corner_x);
			
	corner_y = corner_y|corner_y;
	
	for ( var i=0; i<this.climbingMaxH; i++ ) {
		var px1 = this.map.getPixelSimpleStateAt(corner_x+col.coldir.x, corner_y-i);
		var px2 = this.map.getPixelSimpleStateAt(corner_x+col.coldir.x, corner_y-i-1);
		if ( px1 == this.map.NOT_AIR_PIXEL && px2 == this.map.AIR_PIXEL ) {
			if ( this.map.getMaterialBoxSimpleStateAt(corner_x+col.coldir.x - (col.coldir.x == 1 ? (this.mainShape.w-1) : 0), (corner_y-i-1)-(this.mainShape.h-1), this.mainShape.w, this.mainShape.h) == this.map.AIR_PIXEL )
				return i+1; //wysokość najścia na material
		}
	}

	return false;
}

CPlayer.prototype.testRoofing = function(col) {
	var corner_x = this.mainShape.getWorldEdgePosition(col.coldir.x == 1 ? 1 : 3);
	var corner_y = this.mainShape.getWorldEdgePosition(0);

	if ( col.coldir.x == -1 ) corner_x = corner_x|corner_x;
	else corner_x = Math.ceil(corner_x);
			
	corner_y = corner_y|corner_y;
	
	for ( var i=0; i<this.climbingMaxH; i++ ) {
		var px1 = this.map.getPixelSimpleStateAt(corner_x+col.coldir.x, corner_y+i);
		var px2 = this.map.getPixelSimpleStateAt(corner_x+col.coldir.x, corner_y+i+1);
		if ( px1 == this.map.NOT_AIR_PIXEL && px2 == this.map.AIR_PIXEL ) {
			if ( this.map.getMaterialBoxSimpleStateAt(corner_x+col.coldir.x - (col.coldir.x == 1 ? (this.mainShape.w-1) : 0), (corner_y+i+1), this.mainShape.w, this.mainShape.h) == this.map.AIR_PIXEL )
				return i+1; //wysokość najścia na material
		}
	}

	return false;
}

CPlayer.prototype.onCollision = function(col) {
	var repeat = false;

	var VX = this.velocity.x;

	CObject.prototype.onCollision.call(this, col);

	if ( col.shape.type == "box" ) {
		if ( col.coldir.x == -1 && this.climbingVelocity.x < 0 ) this.climbingVelocity.x = 0;
		else if ( col.coldir.x == 1 && this.climbingVelocity.x > 0 ) this.climbingVelocity.x = 0;
		
		if ( col.coldir.y == -1 && this.climbingVelocity.y < 0 ) this.climbingVelocity.y = 0;
		else if ( col.coldir.y == 1 && this.climbingVelocity.y > 0 ) this.climbingVelocity.y = 0;
	}
	
	if ( col.shape === this.mainShape ) {
		if ( col.coldir.x != 0 && Math.abs(VX) >= 0 ) {
			var slopeHeight = this.testClimbing(col);
			if ( slopeHeight !== false ) {
				if ( this.velocity.y > 0 ) this.velocity.y = 0;
				
				this.climbingVelocity.y = -this.climbingSpeed;
				
				this.climbingSkipVX += VX;
				this.velocity.x += VX;
				
				this.climbing = true;
				
				repeat = true;
			}
			else {
				var slopeHeight = this.testRoofing(col);
				if ( slopeHeight !== false ) {
					if ( this.velocity.y < 0 ) this.velocity.y = 0;
					
					this.climbingVelocity.y = this.climbingSpeed;
					
					this.climbingSkipVX += VX;
					this.velocity.x += VX;
					
					this.climbing = true;
					
					repeat = true;
				}
				else if ( this.moving && this.velocity.y > 0 ) {
					this.velocity.y = 0;
				}
			}
		}
	}
	
	return repeat;
}