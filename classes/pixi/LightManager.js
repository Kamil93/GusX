PIXI.LightManager = function(bgTexture, loaded_fn) {
	var that = this;

	//----------------------------//
	
	this.bgTexture = bgTexture; //tekstura tła lightmapy
	this.bgSprite = null; //sprite do jej wyświetlania
	
	this.texture = null; //tekstura na którą renderowane są wszystkie światła a która jest texturą tej klasy(Sprite/LightManager)
	
	this.container = new PIXI.DisplayObjectContainer();
	this.container.manager = this;
	
	//----------------------------//

	this.bgSprite = new PIXI.Sprite(this.bgTexture);
	this.container.addChild(this.bgSprite);

	this.texture = new PIXI.RenderTexture(this.bgTexture.width, this.bgTexture.height);
	
	PIXI.Sprite.call(this, this.texture);
	this.blendMode = PIXI.blendModes.MULTIPLY;
}

PIXI.LightManager.prototype = Object.create(PIXI.Sprite.prototype);

PIXI.LightManager.prototype.addLight = function(light) {
	light.blendMode = PIXI.blendModes.ADD;

	this.container.addChild(light);
}

PIXI.LightManager.prototype.onUpdate = function() {
	if ( this.texture ) this.texture.render(this.container);
}

PIXI.LightManager.prototype.onDestroy = function() {
}