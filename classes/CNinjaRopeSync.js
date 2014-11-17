CNinjaRope.prototype.serializeForCollisionsSync = function() {
	var serialized = CObject.prototype.serializeForCollisionsSync.call(this);
	
	serialized.att = this.attached;
	
	return serialized;
}

CNinjaRope.prototype.forCollisionsSync = function(data) {
	CObject.prototype.forCollisionsSync.call(this, data);
	
	this.attached = data.att;
}

CNinjaRope.prototype.serializeForRegularSync = function() {
	var serialized = CObject.prototype.serializeForRegularSync.call(this);
	
	serialized.att = this.attached;
	serialized.bt = this.body.type;
	
	return serialized;
}

CNinjaRope.prototype.forRegularSync = function(data) {
	CObject.prototype.forRegularSync.call(this, data);
	
	this.attached = data.att;
	this.body.type = data.bt;
}