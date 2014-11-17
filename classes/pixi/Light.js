PIXI.Light = function(object, texture) {
	PIXI.Sprite.call(this, texture);
	
	this.radius = (texture.width * 0.5) * this.scale.x;
	this.object = object;
	this.culled = false;
	this.occfilter = null;
}

PIXI.Light.prototype = Object.create(PIXI.Sprite.prototype);

PIXI.Light.prototype.onUpdate = function() {
	if ( this.occfilter ) this.occfilter.onUpdate();
}

PIXI.Light.prototype.setCulling = function(val) {
	if ( this.culled != val ) {
		this.culled = val;
	
		if ( this.culled ) {
			this.occfilter = new PIXI.OccFilter(this);
			this.filters = [this.occfilter];
		}
		else {
			this.occfilter = null;
			this.filters = null;
		}
	}
}