PIXI.MapGfx = function(map, loaded_fn) {
	var that = this;

	PIXI.DisplayObjectContainer.call(this);
	
	this.PART_SIZE = 512;
	
	this.LAYER_COUNT = 4;
	
	this.LAYER_EXP = 0;
	this.LAYER_1 = 1;
	this.LAYER_2 = 2;
	this.LAYER_TOP = this.LAYER_COUNT-1;
	
	//----------------------------//
	
	this.map = map;
	
	this.loadTimer = null;
	
	this.position = {x: 0, y: 0};
	
	this.textures = {
		parts: [],
		level: null,
		material: null,
		lightmap: null
	};
	
	this.level = null;
	this.lightmap = null;
	
	this.layer = new Array(this.LAYER_COUNT);
	
	//----------------------------//
	
	for ( var i=0; i<that.layer.length; i++ ) {
		that.layer[i] = new PIXI.DisplayObjectContainer();
	}
	
	this.loadResources(function() {
		that.divideLevel();
		
		that.level = new PIXI.Level(that.textures.parts);
		
		that.lightmap = new PIXI.LightManager(that.textures.lightmap);
		that.lightmap.alpha = 1;
		
		that.addChild(that.level);
		that.addChild(that.layer[0]);
		that.addChild(that.layer[1]);
		that.addChild(that.lightmap);
		that.addChild(that.layer[2]);
		
		loaded_fn();
	});
}

PIXI.MapGfx.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

PIXI.MapGfx.prototype.loadResources = function(loaded_fn) {
	var that = this;

	var directory = "assets/maps/" + this.map.game.mapName;
	
	this.textures.level = PIXI.Texture.fromImage(directory + "/level.png");
	this.textures.material = PIXI.Texture.fromImage(directory + "/material.png");
	this.textures.lightmap = PIXI.Texture.fromImage(directory + "/lightmap.png");
	
	this.loadTimer = setInterval(function() {
		var loaded = true;
		
		for ( var texture in that.textures ) {
			if ( texture != "parts" && that.textures[texture].baseTexture.hasLoaded == false ) {
				loaded = false;
				break;
			}
		}

		if ( loaded ) {
			loaded_fn();
			clearInterval(that.loadTimer);
		}
	}, 500);
}

PIXI.MapGfx.prototype.divideLevel = function() {
	var cols = Math.ceil(this.textures.level.width / this.PART_SIZE);
	var rows = Math.ceil(this.textures.level.height / this.PART_SIZE);
	
	for(var y = 0; y < rows; y++) {
		for(var x = 0; x < cols; x++) {
			var level_canvas = document.createElement("canvas");
			var material_canvas = document.createElement("canvas");
			level_canvas.width = this.PART_SIZE;
			level_canvas.height = this.PART_SIZE;
			material_canvas.width = this.PART_SIZE;
			material_canvas.height = this.PART_SIZE;
			var level_context = level_canvas.getContext("2d");
			var material_context = material_canvas.getContext("2d");

			var widthLeft = this.textures.level.width - (x * this.PART_SIZE);
			var heightLeft = this.textures.level.height - (y * this.PART_SIZE);
			
			level_context.drawImage(
				this.textures.level.baseTexture.source,
				x * this.PART_SIZE, y * this.PART_SIZE,
				Math.min(this.PART_SIZE, widthLeft), Math.min(this.PART_SIZE, heightLeft),
				0, 0,
				Math.min(this.PART_SIZE, widthLeft), Math.min(this.PART_SIZE, heightLeft)
			);
			material_context.drawImage(
				this.textures.material.baseTexture.source,
				x * this.PART_SIZE, y * this.PART_SIZE,
				Math.min(this.PART_SIZE, widthLeft), Math.min(this.PART_SIZE, heightLeft),
				0, 0,
				Math.min(this.PART_SIZE, widthLeft), Math.min(this.PART_SIZE, heightLeft)
			);
			
			this.textures.parts.push({
				x: x*this.PART_SIZE, y: y*this.PART_SIZE,
				level_tex: PIXI.Texture.fromCanvas(level_canvas),
				material_tex: PIXI.Texture.fromCanvas(material_canvas)
			});
		}
	}
}

PIXI.MapGfx.prototype.addChildToLayer = function(layer, child) {
	if ( layer < 0 || layer > this.layer.length-1 ) layer = 0;
	
	this.layer[layer].addChild(child);
}

PIXI.MapGfx.prototype.onUpdate = function() {
	if ( this.lightmap ) this.lightmap.onUpdate();
}

PIXI.MapGfx.prototype.onDestroy = function() {
	clearInterval(this.loadTimer);
}