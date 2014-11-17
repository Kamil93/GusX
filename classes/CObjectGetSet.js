CObject.prototype.getShape = function(name) {
	for ( var i=0; i<this.shapes.length; i++ ) {
		if ( this.shapes[i].name == name ) return this.shapes[i];
	}
	return undefined;
}

CObject.prototype.setPosition = function(x, y) {
	this.setPositionX(x);
	this.setPositionY(y);
}

CObject.prototype.setPositionX = function(x) {
	this.position.x = x;
}
CObject.prototype.setPositionY = function(y) {
	this.position.y = y;
}

CObject.prototype.setVelocity = function(x, y) {
	this.velocity.x = x;
	this.velocity.y = y;
}

CObject.prototype.getVelocityX = function() {
	return this.velocity.x;
}

CObject.prototype.getVelocityY = function() {
	return this.velocity.y;
}

CObject.prototype.setMaxSpeed = function(val) {
	this.maxSpeed = val;
	if ( this.maxSpeed > this.MAX_SPEED ) this.maxSpeed = this.MAX_SPEED;
}

CObject.prototype.getSpeed = function() {
	return this.map.game.tools.lineDistance(0, 0, this.velocity.x, this.velocity.y);
}

CObject.prototype.getSpeedRadianAngle = function() {
	return Math.atan2(this.velocity.y, this.velocity.x);
}

CObject.prototype.getSpeedAngle = function() {
	return this.getSpeedRadianAngle() * (180 / Math.PI);
}

CObject.prototype.getAngle = function() {
	return this.getSpeedAngle();
}

CObject.prototype.setSpeed = function(rad_angle, speed) {
	this.velocity.x = speed * Math.cos(rad_angle);
	this.velocity.y = speed * Math.sin(rad_angle);
}

CObject.prototype.isMoving = function() {
	return (this.velocity.x != 0 || this.velocity.y != 0);
}

CObject.prototype.applyForce = function(x, y) {
	this.velocity.x += x;
	this.velocity.y += y;
}

CObject.prototype.setSleep = function(sleep) {
	this.sleep = sleep;
}