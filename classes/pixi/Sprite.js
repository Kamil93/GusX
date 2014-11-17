//extending PIXI.Sprite class

PIXI.Sprite.prototype.__defineGetter__("flippedH", function() {
	return (this._flippedH === true);
});

PIXI.Sprite.prototype.__defineSetter__("flippedH", function(val) {
	if ( val != (this._flippedH===true) ) {
		if ( val ) {
			this.anchor.x = 0.9;
			this.scale.x *= -1;
		}
		else {
			this.anchor.x = 0;
			this.scale.x *= -1;
		}
	}

	this._flippedH = val;
});

PIXI.Sprite.prototype.__defineGetter__("scaleX", function() {
	return Math.abs(this.scale.x);
});

PIXI.Sprite.prototype.__defineSetter__("scaleX", function(val) {
	this.scale.x = val * (this.scale.x < 0 ? -1 : 1);
});