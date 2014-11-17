CMap = function(game, loaded_fn) {
	var that = this;

	this.MAX_TIME_FOR_MAP_LOADING = 1000 * 60 * 0.25;
	
	//------------------------------------------------------
	
	this.game = game;
	
	this.objects = [];
	this.objectsToRemove = [];
	this.objectsToAdd = [];
	
	this.width = 0;
	this.height = 0;
	
	//------------------------------------------------------

	if ( this.game.gusx.isBrowser() ) this.clientInitialize();
	
	this.materialDataInit();
	this.physicDataInit();
	
	this.load(loaded_fn);
}

CMap.prototype.clientInitialize = function() {
	this.gfx = null;
	this.camera = null;
}

CMap.prototype.getRandomPositionOnMap = function() {
	return {
		x: this.game.tools.randomInteger(0, this.width),
		y: this.game.tools.randomInteger(0, this.height)
	};
}

CMap.prototype.getObjectByID = function(id) {
	for ( var i=0; i<this.objects.length; i++ ) {
		if ( this.objects[i].id == id ) return this.objects[i];
	}
	return null;
}

CMap.prototype.load = function(done_fn) {
	this.unload();

	var that = this;
	
	if ( this.game.gusx.isBrowser() )
		this.camera = new CCamera(this);

	var load_test_start_time = this.game.tools.currentTime();
	var load_test = {
		"map_gfx": null,
		"map_material": null,
		"map_config": null
	};
	if ( this.game.gusx.isBrowser() == false ) delete load_test["map_gfx"];
	
	var done_inner_fn = function(done) {
		if ( done == false )
			that.game.tools.log("reasons: " + JSON.stringify(load_test));
		else
			that.physicStart();
		
		done_fn(done);
	}
	
	//load map
	this.loadMaterial(function(done) { 
		that.createGrid();
		load_test["map_material"] = done;
	});	
	this.loadConfig(function(done) { load_test["map_config"] = done; });
	
	if ( this.game.gusx.isBrowser() ) {
		this.gfx = new PIXI.MapGfx(this, function() { load_test["map_gfx"] = true; });
		this.game.stage.addChild(this.gfx);
	}
	
	//check if all was loaded correctly	
	var check_loading_timer = setInterval(function() {
		var all_is_loaded = true;
	
		for ( var key in load_test ) {
			if ( load_test[key] === null || load_test[key] === false ) {
				all_is_loaded = false;
				
				if ( load_test[key] === false ) {
					that.game.tools.log("Map " + that.game.mapName + " loading failed.");
					clearInterval(check_loading_timer);
					done_inner_fn(false);
					
					break;
				}
			}
		}
		
		if ( all_is_loaded && that.game.spritesAtlas !== null ) {
			that.game.tools.log("Map " + that.game.mapName + " has loaded.");
			clearInterval(check_loading_timer);
			done_inner_fn(true);
		}
		else {
			var diff_time = that.game.tools.currentTime() - load_test_start_time;
			if ( diff_time > that.MAX_TIME_FOR_MAP_LOADING ) {
				that.game.tools.log("Map " + name + " loading failed. Requesting took too long.");
				clearInterval(check_loading_timer);
				done_inner_fn(false);
			}
		}
	}, 500);
}

CMap.prototype.loadConfig = function(done_fn) {
	var that = this;

	done_fn(true);
	return;
}

CMap.prototype.unload = function() {
	if ( this.gfx ) this.gfx.onDestroy();

	this.gfx = null;

	this.objects = [];
	
	this.width = 0;
	this.height = 0;
	
	this.camera = null;
	
	this.physicStop();
}

CMap.prototype.createObject = function(sync, class_type, def_name, x, y) {
	if ( this.game.gusx.isClient() && !sync ) return null;

	var new_object = new class_type(this, this.game.getObject(def_name));
	this.addObjectToMap(new_object);
		
	new_object.setPosition(x, y);
	new_object.setSleep(false);
	
	new_object.id = uuid.v1();
	
	return new_object;
}

CMap.prototype.removeObject = function(object) {
	var indexOf = this.objects.indexOf(object);
	if (indexOf != -1) {
		object.onDestroy();
	
		this.objects.splice(indexOf, 1);
	}
}

CMap.prototype.update = function() {
	for ( var i=0; i<this.objects.length; i++ ) {
		if ( this.objects[i].sleep == false ) {
			//console.log(this.objects[i].defName + ", " + JSON.stringify(this.objects[i].position));
			this.objects[i].update();
		}
	}
	
	this.gfx.onUpdate();
	this.camera.update();
}

CMap.prototype.updateObjectsManagement = function() {
	for ( var i=0; i<this.objectsToRemove.length; i++ ) {
		this.removeObject(this.objectsToRemove[i]);
		if ( typeof(this.objectsToRemove[i].remove_done_fn) == "function" )
			this.objectsToRemove[i].remove_done_fn();
	}
	this.objectsToRemove = [];
	
	//--------------
	
	var syncObjsToAdd = [];

	for ( var i=0; i<this.objectsToAdd.length; i++ ) {
		if ( this.objectsToAdd[i].collectedToRemove == false ) {
			this.objects.push(this.objectsToAdd[i]);
			this.objectsToAdd[i].onMap = true;

			if ( this.game.gusx.isHost() ) {
				var sobj = this.objectsToAdd[i].serializeForCreateSync();
				if ( sobj !== false ) syncObjsToAdd.push(sobj);
			}
		}
	}
	this.objectsToAdd = [];
	
	if ( this.game.gusx.isHost() && syncObjsToAdd.length > 0 ) this.game.gusx.syncNewObjects(syncObjsToAdd);
}

CMap.prototype.addObjectToRemove = function(object, done_fn) {
	if ( object.collectedToRemove ) return;

	this.objectsToRemove.push(object);
	object.collectedToRemove = true;
	object.remove_done_fn = done_fn;
}

CMap.prototype.addObjectToMap = function(object) {
	if ( object.collectedToRemove || this.onMap || this.objectsToAdd.indexOf(object) != -1 ) return;
	
	this.objectsToAdd.push(object);
}