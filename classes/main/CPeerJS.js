CPeerJS = function(gusx, hostConnID) {
	var that = this;

	this.gusx = gusx;

	this.id = uuid.v1();
	
	this.peer = null;
	
	this.hostConn = {
		reliable: null,
		unreliable: null
	};
	
	this.connectToMasterServer(function() {
		if ( hostConnID !== undefined )
			that.connectToHostPeer(hostConnID);
	});
}

CPeerJS.prototype.connectToMasterServer = function(connected_fn) {
	var that = this;

	this.peer = new Peer(this.id, {
		key: 'lwjd5qra8257b9',
		/*port: gusxConfig.masterServer.port,
		host: gusxConfig.masterServer.host,
		path: gusxConfig.masterServer.path,*/
		config: {
			"iceServers": [
				{ url: "stun:stun.l.google.com:19302" },
				//{ url: 'turn:homeo@turn.bistri.com:80', credential: 'homeo' }
			]
		},
		debug: 1
	});
	
	this.peer.on("open", function(id) {
		console.log("CPeerJS opened connection to master server, id: " + id);
		connected_fn();
	});
	
	this.peer.on("connection", function(conn) {
		conn.on("open", function(ev) { that.handleEvent(conn, {type: "connection"}); });
		conn.on("data", function(ev) { that.handleEvent(conn, ev); });
		conn.on("close", function() { that.handleEvent(conn, {type: "disconnection"}); });
		conn.on("error", function(err) { console.log(err); });
	});
}

CPeerJS.prototype.connectToHostPeer = function(requested_peer_id) {
	var that = this;

	var do_connect_fn = function(channel) {
		that.hostConn[channel] = that.peer.connect(requested_peer_id, {
			reliable: true,
			serialization: "json",
			label: channel
		});

		that.hostConn[channel].on("open", function() {
			that.handleEvent(that.hostConn[channel], {type: "connected"});
			
			that.hostConn[channel].on("data", function(ev) { that.handleEvent(that.hostConn[channel], ev); });
			that.hostConn[channel].on("close", function() { that.handleEvent(that.hostConn[channel], {type: "disconnected"}); });
			that.hostConn[channel].on("error", function(err) { console.log(channel, err); });
		});
	}
	
	do_connect_fn("reliable");
	do_connect_fn("unreliable");
}

CPeerJS.prototype.broadcastEvent = function(channel, ev, test_fn) {
	var conn_id;

	for ( conn_id in this.peer.connections ) {
		var conn = this.peer.connections[conn_id][0].label == channel ? this.peer.connections[conn_id][0] : this.peer.connections[conn_id][1];
		
		if ( conn !== undefined && (test_fn === undefined || test_fn(conn)) )
			this.sendEventToClient(conn, ev);
	}
}

CPeerJS.prototype.sendEventToHost = function(channel, ev) {
	var that = this;
	setTimeout(function() { 
	var conn = that.hostConn[channel];
	if ( conn ) conn.send(ev);
	else console.log("[CPeerJS.sendEventToHost]: Error, channel not exists.");
	}, 40);
}

CPeerJS.prototype.sendEventToClient = function(conn, ev) {
	if ( conn.label == "unreliable" ) {
		ev.t = (new Date()).getTime();
	}

	conn.send(ev);
}

CPeerJS.prototype.handleEvent = function(conn, ev) {
	if ( this.gusx.handleEvent(conn, ev) === "unknown" )
		this.unknownEventType(conn, ev);
}

CPeerJS.prototype.unknownEventType = function(conn, ev) {
	console.log("unknown event type:", ev);
}