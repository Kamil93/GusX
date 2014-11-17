CObject = function CObject(map, definition) {
	this.collisionDataInit();

	this.MAX_SPEED = 1250;
		
	this.STATIC = 0;
	this.KINESTETIC = 1;
	this.DYNAMIC = 2;

	//----------------------------

	this.id = undefined;
	
	this.collectedToRemove = false;
	this.onMap = false;
	
	this.map = map;
	
	this.defName = "notcreated";
	
	this.sleep = false;
	this.sync = true;
	
	this.position = {x: 0, y: 0};
	this.nextPosition = {x: 0, y: 0};
	this.velocity = {x: 0, y: 0};
	
	this.maxSpeed = this.MAX_SPEED;
	
	this.skipVelocityStep = false;

	this.body = {
		type: this.DYNAMIC,
		damping: 0,
		dampingMinVelocity: {x: 0, y: 0}
	};
	this.shapes = [];
	
	this.gfx = null;
	
	this.lights = [];
	
	this.events = {
		timers: [],
		exec: {}
	};

	if ( definition !== undefined ) this.define(definition);
}

//----------------------------

CObject.prototype.limitSpeedTo = function() {
	var curSpeed = this.getSpeed();

	if ( curSpeed > this.maxSpeed ) {
		var ratio = this.maxSpeed / curSpeed;
		this.velocity.x *= ratio;
		this.velocity.y *= ratio;
	}
}

CObject.prototype.update = function() {
	if ( this.gfx ) {
		this.gfx.position.x = Math.round(this.position.x + this.gfx.localX);
		this.gfx.position.y = Math.round(this.position.y + this.gfx.localY);
	}
	if ( this.lights ) {
		for ( var i=0; i<this.lights.length; i++ ) {
			this.lights[i].position.x = this.position.x + this.lights[i].localX;
			this.lights[i].position.y = this.position.y + this.lights[i].localY;
			this.lights[i].onUpdate();
		}
	}
	for ( var i=0; i<this.shapes.length; i++ ) {
		if ( ( this.shapes[i].type == "box" || this.shapes[i].type == "particle_sensor" ) && this.shapes[i].gfx !== null ) {
			//this.shapes[i].gfx.position.x = Math.round(this.position.x + this.shapes[i].x);
			//this.shapes[i].gfx.position.y = Math.round(this.position.y + this.shapes[i].y);
		}
	}
}

CObject.prototype.calculateNextPosition = function() {
	this.nextPosition = {
		x: this.position.x + this.velocity.x * this.map.DT_SEC,
		y: this.position.y + this.velocity.y * this.map.DT_SEC
	};
}

CObject.prototype.physicStep = function() {
	this.calculateNextPosition();

	var collisions = [];
	
	if ( this.body.type != this.STATIC ) {
		for ( var i=0; i<this.shapes.length; i++ ) {
			var collision = this.checkShapeMaterialCol(this.shapes[i]);
			if ( collision ) collisions.push(collision);
		}
	}
	
	return collisions;
}

CObject.prototype.changePositionStep = function(buf, dt) {
	if ( !buf ) {
		this.position.x += this.velocity.x * (dt ? dt : this.map.DT_SEC);
		this.position.y += this.velocity.y * (dt ? dt : this.map.DT_SEC);
	}
	else {
		buf.px += buf.vx * (dt ? dt : this.map.DT_SEC);
		buf.py += buf.vy * (dt ? dt : this.map.DT_SEC);
	}
}

CObject.prototype.changeVelocityStep = function(buf, dt) {
	if ( !buf ) {
		this.velocity.x += this.map.physicGravity.x * (dt ? dt : this.map.DT_SEC);
		this.velocity.y += this.map.physicGravity.y * (dt ? dt : this.map.DT_SEC);
	}
	else {
		buf.vx += this.map.physicGravity.x * (dt ? dt : this.map.DT_SEC);
		buf.vy += this.map.physicGravity.y * (dt ? dt : this.map.DT_SEC);
	}
}

CObject.prototype.afterPhysicStep = function() {
	//check position
	//if ( this.position.x < 0 || this.position.x >= this.map.width || this.position.y < 0 || this.position.y >= this.map.height ) this.setSleep(true);
	
	//move position
	if ( this.skipVelocityStep == false ) {
		if ( this.body.type != this.STATIC ) {
			this.changePositionStep();
	
			//change velocity	
			if ( this.body.type == this.DYNAMIC ) {
				this.changeVelocityStep();
			}
		
			this.limitSpeedTo(this.maxSpeed);
		}
	}
	this.skipVelocityStep = false;
	
	this.checkTimerEvents();
}

CObject.prototype.checkTimerEvents = function() {
	for ( var i=0; i<this.events.timers.length; i++ ) {
		this.events.timers[i].check();
	}
}

CObject.prototype.fireEvent = function(event_name) {
	var e = this.events.exec[event_name];
	if ( e ) e.run();
}

CObject.prototype.onCollision = function(col) {
	if ( col.shape.type == "box" ) {
		var posx_tmp = this.position.x;
		var posy_tmp = this.position.y;
	
		if ( col.coldir.x != 0 || (col.coldir.x == 0 && Math.round(col.colpos.y) != Math.round(posy_tmp) && Math.abs(this.velocity.y) >= this.map.COLPOS_BAXIS_VELOCITY ) )
			this.setPositionX(col.colpos.x);
			
		if ( col.coldir.y != 0 || (col.coldir.y == 0 && Math.floor(col.colpos.x) != Math.floor(posx_tmp) && Math.abs(this.velocity.x) >= this.map.COLPOS_BAXIS_VELOCITY ) )
			this.setPositionY(col.colpos.y);

		this.velocity.x = col.coldir.x == 0 ? this.velocity.x : -this.velocity.x*(Math.abs(this.velocity.x) >= this.body.dampingMinVelocity.x ? this.body.damping : 0);
		this.velocity.y = col.coldir.y == 0 ? this.velocity.y : -this.velocity.y*(Math.abs(this.velocity.y) >= this.body.dampingMinVelocity.y ? this.body.damping : 0);
	}

	this.fireEvent("ground_collision");
}

CObject.prototype.addToRemove = function(done_fn) {
	this.velocity.x = this.velocity.y = 0;
	this.map.addObjectToRemove(this, done_fn);
}

CObject.prototype.onDestroy = function() {
	if ( this.map.game.gusx.isBrowser() ) {
		this.gfx.parent.removeChild(this.gfx);
	
		for ( var i=0; i<this.lights.length; i++ ) {
			this.lights[i].parent.removeChild(this.lights[i]);
		}
	}
	
	for ( var i=0; i<this.shapes.length; i++ ) {
		this.shapes[i].onDestroy();
	}
}