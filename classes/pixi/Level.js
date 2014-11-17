PIXI.Level = function(parts) {
	PIXI.DisplayObjectContainer.call(this);
	
	for ( var i=0; i<parts.length; i++ ) {
		var part = new PIXI.Sprite(parts[i].level_tex);
		part.position.x = parts[i].x;
		part.position.y = parts[i].y;
		this.addChild(part);
	}
}

PIXI.Level.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);