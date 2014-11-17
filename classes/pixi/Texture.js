//extending PIXI.Sprite class

PIXI.Texture.prototype.onLoaded = function(loaded_fn) {
	if ( this.baseTexture && this.baseTexture.hasLoaded ) {
		loaded_fn();
		return;
	}
	else {
		this.addEventListener("update", loaded_fn);
		return;
	}
}