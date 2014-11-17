CObject.prototype.define = function(def) {
	this.defName = def.name;

	if ( this.map.game.gusx.isBrowser() ) {
		if ( typeof(def.gfx) == "object" ) this.defineReadGfx(def.name, def.gfx, "gfx");
		if ( typeof(def.lights) == "object" ) this.defineReadLights(def.lights);
	}

	if ( typeof(def.body) == "object" ) {
		this.defineReadBody(def.body);
			
		if ( typeof(def.body.shapes) == "object" ) this.defineReadBodyShapes(def.body.shapes);
	}
	if ( typeof(def.events) == "object" ) this.defineEvents(def.events);
}

CObject.prototype.defineReadGfx = function(def_name, def_gfx, field_name) {
	var spriteTexture = this.map.game.getSpriteTex(def_gfx.filename);
	if ( !spriteTexture ) {
		this.map.game.tools.log("CObject.defineReadGfx(): cant define object as " + def_name + ", sprite " + def_gfx.filename + " doesn't exist.");
		return;
	}

	//create gfx
		if ( def_gfx.frameSize )
			this[field_name] = new PIXI.SpriteSet(this, spriteTexture, def_gfx.frameSize);
		else
			this[field_name] = new PIXI.Sprite(spriteTexture);
			
		this[field_name].position = {x: -9999, y: -9999};
		this[field_name].visible = true;
	
	//define fields of gfx
		if ( def_gfx.position ) {
			this[field_name].localX = def_gfx.position[0] ? def_gfx.position[0] : 0;
			this[field_name].localY = def_gfx.position[1] ? def_gfx.position[1] : 0;
		}
		else {
			this[field_name].localX = 0;
			this[field_name].localY = 0;
		}
		
		if ( def_gfx.pivot ) this[field_name].pivot = new PIXI.Point(def_gfx.pivot[0], def_gfx.pivot[1]);
		
		if ( def_gfx.tint ) this[field_name].tint = def_gfx.tint;
			
		if ( typeof(def_gfx.blend) != "string" ) this[field_name].blendMode = PIXI.blendModes.NORMAL;
		else {
			if ( def_gfx.blend.toLowerCase() == "add" ) this[field_name].blendMode = PIXI.blendModes.ADD;
			else if ( def_gfx.blend.toLowerCase() == "multiply" ) this[field_name].blendMode = PIXI.blendModes.MULTIPLY;
			else if ( def_gfx.blend.toLowerCase() == "screen" ) this[field_name].blendMode = PIXI.blendModes.SCREEN;
			else this[field_name].blendMode= PIXI.blendModes.NORMAL;
		}
	
	if ( typeof(def_gfx.layer) != "number" ) def_gfx.layer = 0;
	this.map.gfx.addChildToLayer(def_gfx.layer, this[field_name]);
}

CObject.prototype.defineReadLights = function(def_lights) {
	for ( var light_name in def_lights ) {
		this.defineReadLight(light_name, def_lights[light_name]);
	}
};

CObject.prototype.defineReadLight = function(name, def_light) {
	var texture = this.map.game.getSpriteTex(def_light.filename);
	if ( !texture ) {
		this.map.game.tools.log("CObject.defineReadLight(): cant define light '" + name + "' in object, sprite " + def_light.filename + " doesn't exist.");
		return;
	}

	var light = new PIXI.Light(this, texture);
	this.map.gfx.lightmap.addLight(light);
	this.lights.push(light);
	
	light.name = name;
	light.position = {x: -9999, y: -9999};
	light.setCulling(def_light.culled === true);
	
	if ( def_light.position ) {
		light.localX = def_light.position[0] ? def_light.position[0] : 0;
		light.localY = def_light.position[1] ? def_light.position[1] : 0;
	}
	else {
		light.localX = 0;
		light.localY = 0;
	}
	
	if ( def_light.anchor ) light.anchor = new PIXI.Point(def_light.anchor[0], def_light.anchor[1]);
	if ( typeof(def_light.tint) == "string" ) light.tint = parseInt(Math.floor(Math.random()*16777215).toString(16), 16);
	else light.tint = def_light.tint;
	
	if ( def_light.alpha ) light.alpha = parseFloat(def_light.alpha);
}

CObject.prototype.defineReadBody = function(body) {
	if ( body.type == "static" ) this.body.type = this.STATIC;
	else if ( body.type == "kinestetic" ) this.body.type = this.KINESTETIC;
	else this.body.type = this.DYNAMIC;
	
	this.body.damping = body.damping ? parseFloat(body.damping) : 0;
	if ( typeof(body.dampingMinVelocity) == "object" ) {
		this.body.dampingMinVelocity.x = body.dampingMinVelocity[0] ? parseFloat(body.dampingMinVelocity[0]) : 0;
		this.body.dampingMinVelocity.y = body.dampingMinVelocity[1] ? parseFloat(body.dampingMinVelocity[1]) : 0;
	}
}

CObject.prototype.defineReadBodyShapes = function(shapes) {
	for ( var name in shapes ) {
		var shape_type = shapes[name][0];
		var shape = null;
		
		if ( shape_type == "box" ) shape = new CShapeBox(this, shape_type, name, shapes[name][1], shapes[name][2], shapes[name][3], shapes[name][4]);
		else if ( shape_type == "particle_sensor" ) shape = new CShapeParticleSensor(this, shape_type, name, shapes[name][1], shapes[name][2]);

		shape.onCreated();
		
		if ( shape !== null )
			this.shapes.push(shape);
	}
}

CObject.prototype.defineEvents = function(events) {
	for ( var stem in events ) { //stem to rdzeń po polsku
		var args = stem.split(/[\s,;]+/);
		var actions = events[stem];
		if ( args && args.length > 0 && typeof(actions) == "object" )		
			this.defineEvent(args, actions);
	}
}

CObject.prototype.defineEvent = function(args, actions) {
	var event_id = args[0];
	var event_name = args[1];
	args = args.slice(2);

	if ( (event_name == "timeout" || event_name == "interval") && args.length == 2 ) {
		
		var unit = "" + args[0];
		var delay = parseInt(args[1]);
		
		if ( unit == "s" ) delay *= 1000;
		else if ( unit == "m" ) delay *= 60000;
		
		var t_event = new CScriptTimerEvent(this, event_name == "interval", delay);

		if ( t_event.addActions(actions) )
			this.events.timers.push( t_event );
	}
	else {
		var e_event = new CScriptEvent(this);

		if ( e_event.addActions(actions) )
			this.events.exec[event_name] = e_event;
	}
}