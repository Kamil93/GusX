CClient = function(hostConnID) {
	var that = this;

	CGusX.call(this);
	
	this.config = {
		maxInterpolationDelay: 100
	};
	
	this.lastTimeOfUnreliableEvent = 0;
	
	this.peerjs = null;
	this.hostConnID = hostConnID;
	
	this.hostTimeDiff = 0;
	
	this.type = this.CLIENT;
	this.canvasID = "playground";
	
	this.player = null;
	this.lastPlayerInputTime = 0;

	document.addEventListener("keydown", function(ev) { that.keyboardHandler(ev, true); }, false);	
	document.addEventListener("keyup", function(ev) { that.keyboardHandler(ev, false); }, false);
	
	setInterval(function() {
		$("div#data > span#predic").text("t: " + (new Date()).getTime() + ", " + that.getCurSyncedTime() + ",");
	}, 100);
}

CClient.prototype = Object.create( CGusX.prototype );
CClient.prototype.constructor = CClient;

CClient.prototype.playerIDExist = function(id) {
	return !(this.players[id] === undefined);
}

CClient.prototype.getCurSyncedTime = function() {
	return (new Date()).getTime() + this.hostTimeDiff;
}

CClient.prototype.keyboardHandler = function(event, down) {
	var keyPressed = String.fromCharCode(event.keyCode);

	if ( keyPressed == "W" ) {
		this.setPlayerAction("up", down);
	}
	else if ( keyPressed == "S" ) {
		this.setPlayerAction("down", down);
	}
	else if ( keyPressed == "A" ) {
		this.setPlayerAction("left", down);
	}
	else if ( keyPressed == "D" ) {
		this.setPlayerAction("right", down);
	}
	else if ( keyPressed == "G" ) {
		this.setPlayerAction("jump", down);
	}
	else if ( keyPressed == "H" ) {
		this.setPlayerAction("change", down);
	}
	
	this.lastPlayerInputTime = this.getCurSyncedTime();
}

CClient.prototype.run = function() {
	var that = this;

	this.peerjs = new CPeerJS(this, this.hostConnID);
}

CClient.prototype.handleEvent = function(conn, ev, dupa) {
	var that = this;
	
	if ( dupa === undefined ) {
		setTimeout( function() { that.handleEvent(conn, ev, true); }, 40 );
		return true;
	}
	
	if ( ev.t ) {
		if ( this.lastTimeOfUnreliableEvent > ev.t ) {
			console.log("old event: ", ev);
			return true;
		}
		else this.lastTimeOfUnreliableEvent = ev.t;
	}
	
	switch (ev.type) {
		case "connected":
			this.connected(conn);
		break;
		case "pong":
			this.handlePong(ev);
		break;
		case "gameinfo":
			this.startGame(ev);
		break;
		case "players":
			this.syncPlayers(ev.data);
		break;
		case "objsync":
			this.syncRegularForObjects(ev);
		break;
		case "shootninjarope":
			this.syncShootNinjaRope(ev.id, ev.rope_id, ev.syncData);
		break;
		case "setplayeraction":
			this.setPlayerAction(ev.name, ev.val, ev.conn_id, ev.syncData);
		break;
		default:
			return "unknown";
		break;
	}
	
	return true;
}

CClient.prototype.startGame = function(ev) {
	this.mapName = "" + ev.map;

	CGusX.prototype.run.call(this);
}


CClient.prototype.gameStarted = function() {
	CGusX.prototype.gameStarted.call(this);
	
	var that = this;
	setTimeout(function() {
		console.log("sending game_started");
		that.peerjs.sendEventToHost("reliable", {type: "game_started"});
	}, 3000);
}

CClient.prototype.connected = function(conn) {
	var that = this;

	if ( conn.label == "reliable" ) {
		setTimeout(function() {
			that.peerjs.sendEventToHost("reliable", {type: "ready"});
		}, 3000);
		
		setInterval( function() {
			that.sendPingEvent();
		}, 500);
		this.sendPingEvent();
	}
}

CClient.prototype.sendPingEvent = function() {
	this.peerjs.sendEventToHost("reliable", {type: "ping", ct: (new Date()).getTime()});
}

CClient.prototype.handlePong = function(ev) {
	var curtime = (new Date()).getTime();
	var ping = curtime - ev.ct;
	var latency = ping * 0.5;
	this.hostTimeDiff = Math.round(ev.st - (ev.ct + latency));
	$("div#data > span#ping").text("ping: [" + ping + ", " + latency + "; " + this.hostTimeDiff + "]");
}

CClient.prototype.syncRegularForObjects = function(ev) {
	var diffTime = this.getCurSyncedTime() - ev.t;
	$("div#data > span#v").text(diffTime);
	for ( var i=0; i<ev.data.length; i++ ) {
		var object = this.game.map.getObjectByID(ev.data[i].id);	
		
		if ( object ) {
			object.forRegularSync(ev.data[i], diffTime);
		}
	}
}

CClient.prototype.syncPlayers = function(data) {
	for ( var i=0; i<data.length; i++ ) {
		this.syncPlayer(data[i]);
	}
}

CClient.prototype.syncPlayer = function(player_data) {
	var player_object = null;

	if ( this.playerIDExist(player_data.id) == false ) {
		player_object = this.createNewPlayerObject();
		player_object.id = player_data.id;
	}
	else {
		player_object = this.players[player_data.id];
	}
	
	if ( this.player == null && player_object.id == this.peerjs.id ) {
		this.player = player_object;
		this.game.map.camera.setFollowedObject(this.player);
	}
	
	player_object.forPlayerSync(player_data);
	
	this.players[player_data.id] = player_object;
}

CClient.prototype.setPlayerAction = function(name, val, conn_id, syncData) {
	var player = conn_id ? this.players[conn_id] : this.player;
	
	if ( !player ) return;
	
	//if ( syncData ) player.forPlayerActionSync(syncData);
	
	if ( player.getAction(name) == val ) return;

	if ( !conn_id ) this.peerjs.sendEventToHost("reliable", {type: "setplayeraction", name: name, val: val});
	
	player.setAction(name, val);
}

CClient.prototype.syncShootNinjaRope = function(conn_id, rope_id, syncData) {
	var player = this.players[conn_id];
	if ( !player ) return;
	
	//if ( syncData ) player.forPlayerActionSync(syncData);
	
	player.shootNinjaRope();
	player.ninjaRopeObj.id = rope_id;
}