CWSServer = function(gusx) {
	this.gusx = gusx;

	this.wss = null;
	this.connections = {};
	
	this.listen();
}

CWSServer.prototype.listen = function() {
	var that = this;

	this.wss = new this.gusx.WebSocketServer({port: 8080});
	this.wss.on("connection", function(conn) { that.connection(conn); });
}

CWSServer.prototype.connection = function(conn) {
	var that = this;

	conn.on("message", function(msg) { that.handleMessage(conn, msg); });
	conn.on("close", function() { that.close(conn); });
	
	conn.id = uuid.v1();
	conn.gameStarted = false;
	
	this.connections[conn.id] = conn;
	
	this.gusx.handleEvent(conn, {type: "connection"});
}

CWSServer.prototype.close = function(conn) {
	this.gusx.handleEvent(conn, {type: "disconnection"});
	delete this.connections[conn.id];
}

CWSServer.prototype.broadcastEvent = function(ev, test_fn) {
	ev = JSON.stringify(ev);
	
	var conn_id;
	for ( conn_id in this.connections ) {
		if ( test_fn === undefined || test_fn(this.connections[conn_id]) )
			this.sendEventRaw(this.connections[conn_id], ev);
	}
}

CWSServer.prototype.sendEventRaw = function(conn, ev) {
	conn.send(ev);
}

CWSServer.prototype.sendEvent = function(conn, ev) {
	this.sendEventRaw(conn, JSON.stringify(ev));
}

CWSServer.prototype.handleMessage = function(conn, msg) {
	if ( !this.gusx.handleEvent(conn, JSON.parse(msg)) )
		this.unknownEventType(conn, msg);
}

CWSServer.prototype.unknownEventType = function(conn, ev) {
	console.log("unknown event type:", ev);
}