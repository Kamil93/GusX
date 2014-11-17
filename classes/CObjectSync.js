CObject.prototype.serializeForCreateSync = function() {
	return {
		"id": this.id,
		"def": this.defName,
		"classtype": this.constructor.name,
		
		"px": this.position.x, "py": this.position.y,
		"vx": this.velocity.x, "vy": this.velocity.y,
	};
}

CObject.prototype.forCreateSync = function(data) {
	var classtype = null;
	
	if ( data.classtype == "CObject" ) classtype = CObject;
	else if ( data.classtype == "CNinjaRope" ) classtype = CNinjaRope;
	else if ( data.classtype == "CPlayer" ) classtype = CPlayer;
	
	if ( classtype == null ) {
		this.game.tools.log("Can't synchronize new object from server, unknown classtype", data.classtype);
		return;
	}
	
	var new_object = this.map.createObject(true, classtype, data.def, data.px, data.py);
	new_object.setVelocity(data.vx, data.vy);
	new_object.id = data.id;
}

CObject.prototype.serializeForCollisionsSync = function() {
	return {
		"id": this.id,
		"px": this.position.x, "py": this.position.y,
		"vx": this.velocity.x, "vy": this.velocity.y,
		"btype": this.body.type
	};
}

CObject.prototype.forCollisionsSync = function(data) {
	this.setPosition(data.px, data.py);
	this.setVelocity(data.vx, data.vy);
	this.body.type = data.btype;
}

CObject.prototype.serializeForRegularSync = function() {
	return {
		"id": this.id,
		"px": this.position.x, "py": this.position.y,
		"vx": this.velocity.x, "vy": this.velocity.y
	};
}

CObject.prototype.forRegularSync = function(data, delay) {
	this.changePositionStep(data, delay*2/1000);
	this.changeVelocityStep(data, delay*2/1000);
	
	this.position.x = data.px;
	this.position.y = data.py;
	
	this.velocity.x = data.vx;
	this.velocity.y = data.vy;
}