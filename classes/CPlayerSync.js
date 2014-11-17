CPlayer.prototype.serializeForCreateSync = function() {
	return false;
}

CPlayer.prototype.serializeForCollisionsSync = function() {
	return false;
}

CPlayer.prototype.serializeForPlayerActionSync = function() {
	return {
		"px": this.position.x, "py": this.position.y,
		"vx": this.velocity.x, "vy": this.velocity.y,
		"a": this.angle, "as": this.angleSpeed
	};
}

CPlayer.prototype.forPlayerActionSync = function(serialized) {
	this.setPosition(serialized.px, serialized.py);
	this.setVelocity(serialized.vx, serialized.vy);
	this.angle = serialized.a;
	this.angleSpeed = serialized.as;
}

CPlayer.prototype.serializeForPlayerSync = function() {
	return {
		"id": this.id,
		
		"px": this.position.x, "py": this.position.y,
		"vx": this.velocity.x, "vy": this.velocity.y,
	};
}

CPlayer.prototype.forPlayerSync = function(serialized) {
	this.setPosition(serialized.px, serialized.py);
	this.setVelocity(serialized.vx, serialized.vy);
}

CPlayer.prototype.serializeForRegularSync = function() {
	var serialized = CObject.prototype.serializeForRegularSync.call(this);
	
	serialized.a = this.angle;
	serialized.as = this.angleSpeed;
	
	return serialized;
}

CPlayer.prototype.forRegularSync = function(serialized, delay) {
	CObject.prototype.forRegularSync.call(this, serialized, delay);
	
	this.angle = serialized.a;
	this.angleSpeed = serialized.as;
}