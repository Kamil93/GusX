CMap.prototype.physicDataInit = function() {
	var that = this;
	
	this.PHYSIC_TIMESTEP = 20;
	this.DT = this.PHYSIC_TIMESTEP;
	this.DT_SEC = this.PHYSIC_TIMESTEP / 1000;
	
	this.COLPOS_BAXIS_VELOCITY = 500; //dla jakiej prędkości aplikuje oba wspolrzedne punktu kolizji przy zderzeniu
	this.BRESENHAM_COLERROR = 0.09;
	
	this.physicActive = false;
	
	if ( this.game.gusx.isBrowser() ) {
		this.physicTickerWorker = new Worker("workers/interval.js");
	}
	else {
		this.physicTickerWorker = null;
	}
	
	this.physicGravity = {x: 0, y: 220};
	this.physicPixelFixtures = {};
	this.physicPixelFixtures[this.AIR_PIXEL] = [0, 0.1];
	this.physicPixelFixtures[this.ROCK_PIXEL] = [0.3, 0.3];
	this.physicPixelFixtures[this.DIRT_PIXEL] = [0.1, 0.5];
	this.physicPixelFixtures[this.SEMI_ROCK_PIXEL] = [0.4, 0.3];
}

CMap.prototype.physicStart = function() {
	var that = this;

	var tick_locked = false;
	
	this.physicStop();
	
	this.physicActive = true;	
	this.physicLastStepTime = this.game.tools.currentTime();
	
	if ( this.game.gusx.isBrowser() ) {
		this.physicTickerWorker.postMessage("start;" + parseInt(this.PHYSIC_TIMESTEP));
		this.physicTickerWorker.onmessage = function(e) {
			var data = e.data.split(";");
			var event_name = data[0];
			if ( event_name == "tick" && tick_locked == false ) {
				tick_locked = true;
			
				if ( that.physicActive )
					that.physicStepsInitialize();
					
				tick_locked = false;
			}
			else {
				that.game.tools.log("CMap.physicStart(): Unknown event from webworker: " + JSON.stringify(e.data));
				that.physicTickerWorker = null
			}
		}
	}
	else {
		this.physicTickerWorker = setInterval(function() { that.physicStepsInitialize(); }, parseInt(this.PHYSIC_TIMESTEP));
	}
}

CMap.prototype.physicStop = function() {
	this.physicActive = false;
	if ( this.game.host == false )
		this.physicTickerWorker.postMessage("stop");
	else
		clearInterval(this.physicTickerWorker);
}

CMap.prototype.physicStepsInitialize = function() {
	var currentTime = this.game.tools.currentTime();
	
	var deltaTime = (currentTime - this.physicLastStepTime);	

	var steps = Math.floor(deltaTime / this.DT);
	var left_miliseconds = deltaTime - (steps * this.DT);

	this.physicLastStepTime = currentTime - left_miliseconds;
	
	for ( var i=0; i<steps; i++ ) {	
		this.physicStepInitialize();
	}
	
	if ( this.game.gusx.isHost() ) {
		if ( (currentTime - this.game.gusx.regularSyncLastTime) >= this.game.gusx.regularSyncTimestep ) {
			this.game.gusx.regularObjectSync();
			this.game.gusx.regularSyncLastTime = currentTime;
		}
	}
}

CMap.prototype.physicStepInitialize = function() {
	var objectsToRepeatColTest = [];
	var maxRepeat = 10;
	do {
		var collision_collections = this.physicStep(objectsToRepeatColTest.length > 0 ? objectsToRepeatColTest : this.objects);
		
		if ( collision_collections.length > 0 ) objectsToRepeatColTest = this.physicResolveCollisions(collision_collections);
		else objectsToRepeatColTest = [];
		
		maxRepeat--;
		
		if ( maxRepeat <= 0 && objectsToRepeatColTest.length > 0 ) {
			for ( var i=0; i<objectsToRepeatColTest.length; i++ )
				objectsToRepeatColTest[i].skipVelocityStep = true;
		}
	}
	while(objectsToRepeatColTest.length > 0 && maxRepeat > 0);

	this.afterPhysicStep();
}

CMap.prototype.physicStep = function(objects) {
	var collision_collections = [];

	for ( var i=0; i<objects.length; i++ ) {
		if ( objects[i].sleep == false ) {
			var obj_collisions = objects[i].physicStep();
			if ( obj_collisions && obj_collisions.length > 0 ) {
				collision_collections.push({
					obj: objects[i],
					arr: obj_collisions
				});
			}
		}
	}
	
	return collision_collections;
}

CMap.prototype.afterPhysicStep = function() {
	for ( var i=0; i<this.objects.length; i++ ) {
		if ( this.objects[i].sleep == false ) {
			this.objects[i].afterPhysicStep();
		}
	}
	
	if ( this.game.gusx.isHost() && false )
		this.game.gusx.syncCollidedObjects();
	
	this.updateObjectsManagement();
}

CMap.prototype.physicResolveCollisions = function(collision_collections) {
	var objectsToRepeatColTest = [];

	for ( var i=0; i<collision_collections.length; i++ ) {
		var collection = collision_collections[i];

		var repeatColTest = false;
		for ( var j=0; j<collection.arr.length; j++ ) {
			if ( this.physicResolveCollision(collection.obj, collection.arr[j]) == true ) repeatColTest = true;
		}
		if ( repeatColTest ) objectsToRepeatColTest.push(collection.obj);
	}
	
	return objectsToRepeatColTest;
}

CMap.prototype.physicResolveCollision = function(object, collision) {
	var repeatColTest = false;

	if ( collision.collision == true ) {
		var object = collision.object;

		var repeat = object.onCollision(collision);
		
		if ( repeat || object.getSpeed() >= 25 ) {
			repeatColTest = true;
		}
		
		if ( this.game.gusx.isHost() && this.game.gusx.collidedObjects.indexOf(object) == -1 && false )
			this.game.gusx.collidedObjects.push(object);
	}
	
	return repeatColTest;
}