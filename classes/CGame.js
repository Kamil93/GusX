CGame = function(gusx, canvas_id, mapName, done_fn) {
	var that = this;

	this.CANVAS_WIDTH = 640;
	this.CANVAS_HEIGHT = 480;

	//------------------------------------------------------
	
	this.gusx = gusx;
	
	this.mapName = mapName;
	
	this.tools = new CTools(this);
	
	this.map = null;
	this.objectDefs = {};
	
	//------------------------------------------------------
	
	var initialized_fn = function() {
		that.loadObjects("global", function(done) {
			if ( done ) {
				that.loadObjects(that.mapName, function(done) {
					if ( done ) {
						that.map = new CMap(that, function(done) {
							if ( done ) {
								that.tools.log("fuck yeah");
								if ( that.gusx.isBrowser() ) that.requestAnimationFrames();
								done_fn();
							}
						});
					}
				});
			}
		});
	}
	
	if ( this.gusx.isDedHost() )
		initialized_fn();
	else
		this.browserInitialize(canvas_id, initialized_fn);
}

CGame.prototype.browserInitialize = function(canvas_id, done_fn) {
	var that = this;

	this.canvas_id = canvas_id;
	
	this.stage = null;
	this.renderer = null;
	
	this.spriteList = [];
	this.spritesAtlas = null;
	
	this.keys = {};
	
	this.playerObject = null;
	
	//------------------------------------------------------
	
	this.fpsmeter = new FPSMeter();
	this.fpsmeter.show();
	
	this.initializePixiJS();
	this.loadSpriteList("global", function() {
		that.loadSpriteList(that.mapName, function() {
			that.compileSpriteList(function(done) {
				done_fn();
			});
		});
	});
	
	$(document).keydown(function(e) {
		that.keys[e.keyCode] = true;
	});
	
	$(document).keyup(function(e) {
		that.keys[e.keyCode] = false;
	});
}

CGame.prototype.log = function(str) {
	if ( console && console.log ) console.log(str);
}

CGame.prototype.initializePixiJS = function() {
	this.stage = new PIXI.Stage(0x555555);
	
	var _webgl = true;

	if ( _webgl ) {
		this.renderer = new PIXI.WebGLRenderer(
			this.CANVAS_WIDTH,
			this.CANVAS_HEIGHT,
			document.getElementById(this.canvas_id),
			false,
			false
		);
	}
	else
		this.renderer = new PIXI.CanvasRenderer (this.CANVAS_WIDTH, this.CANVAS_HEIGHT, document.getElementById(this.canvas_id));
}

CGame.prototype.requestAnimationFrames = function(once) {
	var that = this;
	requestAnimFrame(function() {
		that.update();
		that.fpsmeter.tick();
		if ( !once ) that.requestAnimationFrames();
	});
}

CGame.prototype.update = function() {
	this.map.update();

	this.renderer.render(this.stage);
	//this.tools.log("rendered");
}

CGame.prototype.loadSpriteList = function(locname, done_fn) {
	if ( locname === undefined ) locname = "global";

	var that = this;

	var dir = "assets/sprites/";
	if ( locname != "global" ) dir = "assets/maps/" + locname + "/sprites/";
	
	$.get("ajax/getSpriteList.php?locname=" + locname).done(function(list) {
		list = list.split(";");
		for ( var i=0; i<list.length; i++ ) {
			that.spriteList[list[i]] = dir + list[i];
		}
		if ( typeof(done_fn) == "function") done_fn(true);
	}).fail(function( jqxhr, textStatus, error ) {
		that.tools.log( "CMap.loadSpriteList(): Request sprite list failed: " + textStatus + ", " + error );
		if ( typeof(done_fn) == "function") done_fn(false);
	});
}

CGame.prototype.getSpriteTex = function(filename) {
	return this.spriteList[filename];
}

CGame.prototype.loadObjects = function(locname, done_fn) {
	if ( this.gusx.isDedHost() ) {
		return this.loadObjects_nodejs(locname, done_fn);
	}

	var that = this;

	$.get("ajax/getObjectDefs.php?locname=" + locname).done(function(set) {
		set = set.replace(/\s+/g, "");

		var object_defs = JSON5.parse(set);
		
		for ( var key in object_defs ) {
			var def = object_defs[key];
			that.objectDefs[key] = def;
			that.objectDefs[key].name = key;
		}
		
		if ( typeof(done_fn) == "function" ) done_fn(true);
	}).fail(function( jqxhr, textStatus, error ) {
		if ( typeof(done_fn) == "function" ) done_fn(false);
		that.tools.log( "CGame.loadObjects(): Request object list failed: " + textStatus + ", " + error );
	});
}

CGame.prototype.loadObjects_nodejs = function(locname, done_fn) {
	var that = this;

	var directory = "assets/";
	if ( locname != "global" ) directory += "maps/" + locname + "/";
	directory += "objects";
	
	var object_file_list = this.tools.getFileList(directory);
	
	for ( var i=0; i<object_file_list.length; i++ ) {
		var object_file_str = this.gusx.fs.readFileSync(object_file_list[i].full, "utf8");
		var object_def = JSON5.parse(object_file_str);
		this.objectDefs[object_file_list[i].file] = object_def;
		this.objectDefs[object_file_list[i].file].name = object_file_list[i].file;
	}
	
	if ( typeof(done_fn) == "function" ) done_fn(true);
}

CGame.prototype.getObject = function(filename) {
	return this.objectDefs[filename];	
}

CGame.prototype.compileSpriteList = function(done_fn) {
	var that = this;

	var texture = null;
	
	var dom_container = $("<div></div>");
	
	var sprites = [];
	var atlas_size = {w: 0, h: 0, pow2: 0};

	for ( var filename in this.spriteList ) {
		var sprite_imgtag = $("<img src='" + this.spriteList[filename] + "'\>");
		dom_container.append(sprite_imgtag);

		sprites.push({
			img: sprite_imgtag[0],
			filename: filename
		});
	}
	
	var images_to_atlas_data_fn = function() {
		sprites.sort(function(a,b) { return (b.h - a.h); }); // sort inputs for best results
		
		var packer = new GrowingPacker();
		packer.fit(sprites);
		
		atlas_size.w = Math.ceil(packer.root.w/100)*100;
		atlas_size.h = Math.ceil(packer.root.h/100)*100;
		atlas_size.pow2 = that.tools.roundUpToNextPowerOfTwo(Math.max(atlas_size.w, atlas_size.h));
	}
	
	var atlas_data_to_atlas_fn = function(done_fn2) {
		var canvas_buffer = document.createElement("canvas");
		canvas_buffer.width = atlas_size.w;
		canvas_buffer.height = atlas_size.h;
		var context = canvas_buffer.getContext("2d");
		
		for ( var i=0; i<sprites.length; i++ ) {
			context.drawImage(sprites[i].img, sprites[i].fit.x, sprites[i].fit.y);
		}
		
		that.spritesAtlas = PIXI.BaseTexture.fromCanvas(canvas_buffer);
			
		if ( that.spritesAtlas.hasLoaded == true ) {
			done_fn2(true);
		}
		else {
			that.spritesAtlas.addEventListener("loaded", function() {
				done_fn2(true);
			});
		}
	}
	
	var generate_sprites_data_fn = function() {
		that.spriteList = [];
		for ( var i=0; i<sprites.length; i++ ) {
			that.spriteList[sprites[i].filename] = new PIXI.Texture(that.spritesAtlas, new PIXI.Rectangle(
				sprites[i].fit.x, sprites[i].fit.y,
				sprites[i].w-1, sprites[i].h-1
			));
		}
		
		done_fn(true);
	}
	
	dom_container.waitForImages({
		finished: function() {
			for ( var i=0; i<sprites.length; i++ ) {
				sprites[i].w = sprites[i].img.width+1;
				sprites[i].h = sprites[i].img.height+1;
			}

			images_to_atlas_data_fn();
			atlas_data_to_atlas_fn(function(done) {
				if ( done ) generate_sprites_data_fn();
			});
		},
		waitForAll: true
	});
}