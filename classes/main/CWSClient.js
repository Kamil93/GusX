CWSClient = function(gusx) {
	this.gusx = gusx;

	this.ws = null;
	this.connected = false;

	this.connect();
}

CWSClient.prototype.connect = function() {
	var that = this;

	this.ws = new WebSocket("ws://127.0.0.1:8080/");
	this.ws.onopen = function(evt) { that.openConnection(evt); };
	this.ws.onclose = function(evt) { that.closeConnection(evt); };
	this.ws.onmessage = function(evt) { that.message(evt); };
	this.ws.onerror = function(evt) { that.error(evt); };
}

CWSClient.prototype.openConnection = function(evt) {
	this.connected = true;
	this.gusx.handleEvent({type: "connected", evt: evt});
}

CWSClient.prototype.closeConnection = function(evt) {
	this.gusx.handleEvent({type: "disconnected", evt: evt});
}

CWSClient.prototype.message = function(evt) {
	this.handleMessage(evt.data);
}

CWSClient.prototype.error = function(evt) {
	console.log("error: ", evt);
}

CWSClient.prototype.sendEventRaw = function(ev) {
	this.ws.send(ev);
}

CWSClient.prototype.sendEvent = function(ev) {
	this.sendEventRaw(JSON.stringify(ev));
}

CWSClient.prototype.handleMessage = function(message) {
	if ( !this.gusx.handleEvent(JSON.parse(message)) )
		this.unknownEventType(message);
}

CWSClient.prototype.unknownEventType = function(message) {
	console.log("unknown event type:", message);
}