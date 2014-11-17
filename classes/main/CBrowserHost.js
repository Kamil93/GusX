CBrowserHost = function() {
	CClient.call(this);
	
	this.type = this.BROWSER_HOST;
	this.canvasID = "playground";
	
	this.peerjs = null;
	this.connectionData = [];
	
	this.collidedObjects = [];
	
	this.regularSyncWorker = new Worker("workers/interval.js");
	this.regularSyncLastTime = (new Date()).getTime();
	this.regularSyncTimestep = 1000;
	
	setInterval(function() {
		$("div#data > span#predic").text("t: " + (new Date()).getTime() + ",");
	}, 100);
}

CBrowserHost.prototype = Object.create( CClient.prototype );
CBrowserHost.prototype.constructor = CBrowserHost;

CBrowserHost.prototype.run = function() {
	CGusX.prototype.run.call(this);
}

CBrowserHost.prototype.gameStarted = function(conn) {
	var that = this;

	if ( !conn ) {
		CGusX.prototype.gameStarted.call(this);

		this.peerjs = new CPeerJS(this);
	}
	
	if ( conn ) {
		this.connectionData[conn.peer].gameStarted = true;
	}
	
	this.initializePlayer(conn);
	
	if ( conn ) {
		this.syncPlayers();
	}
}

CBrowserHost.prototype.handleEvent = function(conn, ev) {
	switch (ev.type) {
		case "connection":
			this.newConnection(conn);
		break;
		case "ready":
			this.ready(conn);
		break;
		case "ping":
			this.peerjs.sendEventToClient(conn, {type: "pong", st: (new Date()).getTime(), ct: ev.ct});
		break;
		case "game_started":
			this.gameStarted(conn);
		break;
		case "setplayeraction":
			this.setPlayerAction(ev.name, ev.val, conn.peer);
		break;
		default:
			return "unknown";
		break;
	}
	
	return true;
}

CBrowserHost.prototype.newConnection = function(conn) {
	if ( this.connectionData[conn.peer] === undefined ) {
		this.connectionData[conn.peer] = {};
		this.connectionData[conn.peer].gameStarted = false;
	}
}

CBrowserHost.prototype.ready = function(conn) {
	this.peerjs.sendEventToClient(conn, {type: "gameinfo", map: this.mapName});
}

CBrowserHost.prototype.initializePlayer = function(conn) {
	var obj = this.createNewPlayerObject();
	obj.id = conn ? conn.peer : this.peerjs.id;

	this.players[obj.id] = obj;
	
	if ( !conn ) {
		this.player = obj;
		this.game.map.camera.setFollowedObject(this.player);
	}
}

CBrowserHost.prototype.regularObjectSync = function() {
	var that = this;
	var objects = this.game.map.objects;
			
	var data = [];

	for ( var i=0; i<objects.length; i++ ) {
		data.push(objects[i].serializeForRegularSync());
	}
	
	if ( data.length > 0 ) {
		this.peerjs.broadcastEvent("unreliable", {
			type: "objsync",
			data: data
		}, function(_conn) {
			return _conn.peer && that.connectionData[_conn.peer] && that.connectionData[_conn.peer].gameStarted === true;
		});
	}
}

CBrowserHost.prototype.syncPlayers = function() {
	var that = this;
	
	var players_data = [];

	for ( var obj_id in this.players ) {
		players_data.push(this.players[obj_id].serializeForPlayerSync());
	}

	this.peerjs.broadcastEvent("reliable", {
		type: "players",
		data: players_data
	}, function(conn) {
		return that.connectionData[conn.peer].gameStarted == true;
	});
}

CBrowserHost.prototype.setPlayerAction = function(name, val, conn_id) {
	var that = this;

	if ( !conn_id ) conn_id = this.player.id;	
	if ( !this.players[conn_id] ) return;
	
	this.players[conn_id].setAction(name, val);

	this.peerjs.broadcastEvent("reliable", {
		type: "setplayeraction",
		//syncData: this.players[conn_id].serializeForPlayerActionSync(),
		conn_id: conn_id,
		name: name,
		val: val
	}, function(_conn) {
		return _conn.id != conn_id && that.connectionData[_conn.peer].gameStarted == true;
	});
}

CBrowserHost.prototype.syncShootNinjaRope = function(playerObj, rope_id) {
	var that = this;

	this.peerjs.broadcastEvent("reliable", {
		type: "shootninjarope",
		//syncData: this.players[playerObj.id].serializeForPlayerActionSync(),
		id: playerObj.id,
		rope_id: rope_id,
	}, function(conn) {
		return that.connectionData[conn.peer].gameStarted == true;
	});
}