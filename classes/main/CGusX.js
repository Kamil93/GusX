CGusX = function() {
	this.CLIENT = -1;
	this.LOCAL_HOST = 0;
	this.DED_HOST = 1;
	this.BROWSER_HOST = 2;

	//------------------------------------------------------
	
	this.game = null;
	this.gameHasStarted = false;
		
	this.type = this.CLIENT;
	
	this.mapName = "poo";
	this.canvasID = undefined;
	
	this.players = {};
	
	this.playerObjectDefName = "worm.obj";
}

CGusX.prototype.isBrowser = function() {
	return this.type == this.CLIENT || this.type == this.LOCAL_HOST || this.type == this.BROWSER_HOST;
}

CGusX.prototype.isClient = function() {
	return this.type == this.CLIENT;
}

CGusX.prototype.isHost = function() {
	return this.type == this.DED_HOST || this.type == this.LOCAL_HOST || this.type == this.BROWSER_HOST;
}

CGusX.prototype.isDedHost = function() {
	return this.type == this.DED_HOST;
}

//------------------------------------------------------

CGusX.prototype.run = function() {
	var that = this;
	
	this.game = new CGame(this, this.canvasID, this.mapName, function() {
		that.gameStarted();
	});
}

CGusX.prototype.gameStarted = function() {
	this.gameHasStarted = true;
}

//------------------------------------------------------

CGusX.prototype.createNewPlayerObject = function() {
	var obj = this.game.map.createObject(true, CPlayer, this.playerObjectDefName, 100+this.game.tools.randomInteger(0, 50), 175);
	return obj;
}