CGusX = require("./CGusX.js").module;

CHost = function() {
	CGusX.call(this);
	
	this.type = this.DED_HOST;

	this.fs = require("fs");
	this.vm = require("vm");
	this.getPixels = require("get-pixels");
	this.WebSocketServer = require("ws").Server;

	this.server = null;
	this.players = {};
	this.collidedObjects = [];
	
	this.regularSyncTimer = null;
	this.regularSyncTimestep = 500;
}

CHost.prototype = new CGusX();

CHost.prototype.includeFile = function(path) {
	var code = this.fs.readFileSync(path, 'utf-8');
	this.vm.runInThisContext(code, path);
}

CHost.prototype.includeFiles = function() {
	this.includeFile("./libs/json5.js");
	this.includeFile("./libs/bitset/bitset.js");
	this.includeFile("./libs/uuid.js");
	
	this.includeFile("./classes/CTools.js");
	this.includeFile("./classes/CShape.js");
	this.includeFile("./classes/CShapeBox.js");
	this.includeFile("./classes/CShapeParticleSensor.js");
	this.includeFile("./classes/CScriptAction.js");
	this.includeFile("./classes/CScriptEvent.js");
	this.includeFile("./classes/CScriptTimerEvent.js");
	this.includeFile("./classes/CObject.js");
	this.includeFile("./classes/CObjectSync.js");
	this.includeFile("./classes/CObjectDefine.js");
	this.includeFile("./classes/CObjectGetSet.js");
	this.includeFile("./classes/CObjectCol.js");
	this.includeFile("./classes/CNinjaRope.js");
	this.includeFile("./classes/CNinjaRopeSync.js");
	this.includeFile("./classes/CPlayer.js");
	this.includeFile("./classes/CPlayerSync.js");
	this.includeFile("./classes/CGrid.js");
	this.includeFile("./classes/CMap.js");
	this.includeFile("./classes/CMapPhysic.js");
	this.includeFile("./classes/CMapMaterial.js");
	this.includeFile("./classes/CGame.js");
	
	this.includeFile("./classes/main/CWSServer.js");
}

CHost.prototype.run = function() {
	this.includeFiles();

	CGusX.prototype.run.call(this);
}

CHost.prototype.gameStarted = function() {
	var that = this;

	CGusX.prototype.gameStarted.call(this);

	this.server = new CWSServer(this);
	
	this.regularSyncTimer = setInterval(function() {
		var objects = that.game.map.objects;
	
		var data = [];
	
		for ( var i=0; i<objects.length; i++ ) {
			data.push(objects[i].serializeForRegularSync());
		}
		
		if ( data.length > 0 ) {
			that.server.broadcastEvent({
				type: "objsync",
				data: data
			}, function(conn) {
				return conn.gameStarted === true;
			});
		}
	}, this.regularSyncTimestep);
}

CHost.prototype.handleEvent = function(conn, ev) {
	console.log("handle ev: ", ev);

	switch (ev.type) {
		case "connection":
		break;
		case "disconnection":
			this.removePlayer(conn);
		break;
		case "user_conn":
			this.server.sendEvent(conn, {type: "gameinfo", map: this.mapName, game_session_id: conn.id});
		break;
		case "user_reconn":
		break;
		case "game_started":
			conn.gameStarted = true;
			this.syncObjects();
			this.createNewPlayerObject(conn);
		break;
		case "setplayeraction":
			this.setPlayerAction(conn, ev.name, ev.val);
		break;
		default:
			return false;
		break;
	}
	
	return true;
}

CHost.prototype.syncObjects = function() {
	var objects = this.game.map.objects;
	
	var data = [];
	
	for ( var i=0; i<objects.length; i++ ) {
		if ( objects[i].sync == false ) continue;
		
		var sobj = objects[i].serializeForCreateSync();
		if ( sobj !== false ) data.push(sobj);
	}
	
	if ( data.length > 0 )
		this.syncNewObjects(data);
}

CHost.prototype.syncNewObjects = function(data) {
	this.server.broadcastEvent({
		type: "newobjs",
		data: data
	}, function(conn) {
		return conn.gameStarted === true;
	});
}

CHost.prototype.syncPlayers = function() {
	var players_data = [];

	for ( var obj_id in this.players ) {
		players_data.push(this.players[obj_id].serializeForPlayerSync());
	}
	
	this.server.broadcastEvent({
		type: "players",
		data: players_data
	}, function(conn) {
		return conn.gameStarted === true;
	});
}

CHost.prototype.syncCollidedObjects = function() {
	if ( this.collidedObjects.length == 0 ) return;
	
	var data = [];
	
	for ( var i=0; i<this.collidedObjects.length; i++ ) {
		var serialized = this.collidedObjects[i].serializeForCollisionsSync();
		if ( serialized ) data.push(serialized);
	}

	if ( data.length > 0 ) {
		this.server.broadcastEvent({
			type: "colobjects",
			data: data
		}, function(conn) {
			return conn.gameStarted === true;
		});
	}
	
	this.collidedObjects = [];
}

CHost.prototype.syncShootNinjaRope = function(playerObj, rope_id) {
	this.server.broadcastEvent({
		type: "shootninjarope",
		id: playerObj.id,
		rope_id: rope_id,
		syncData: this.players[playerObj.id].serializeForPlayerActionSync()
	}, function(conn) {
		return conn.gameStarted === true;
	});
}

CHost.prototype.createNewPlayerObject = function(conn) {
	var obj = CGusX.prototype.createNewPlayerObject.call(this);
	obj.id = conn.id;
	
	this.players[obj.id] = obj;
	
	this.syncPlayers();
}

CHost.prototype.removePlayer = function(conn) {
	this.players[conn.id].addToRemove();
	delete this.players[conn.id];
	
	this.server.broadcastEvent({
		type: "remplayer",
		id: conn.id
	}, function(_conn) {
		return _conn.gameStarted === true && _conn.id != conn.id;
	});
}

CHost.prototype.setPlayerAction = function(conn, name, val) {
	if ( !this.players[conn.id] ) return;
	
	this.players[conn.id].setAction(name, val);

	this.server.broadcastEvent({
		type: "setplayeraction",
		conn_id: conn.id,
		name: name,
		val: val,
		syncData: this.players[conn.id].serializeForPlayerActionSync()
	}, function(_conn) {
		return _conn.gameStarted === true;
	});
}

exports.module = CHost;