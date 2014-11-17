var PeerServer = require("peer").PeerServer;
var gusxConfig = require("../../config.js").data;

CMasterServer = function() {
	this.server = null;
	this.port = gusxConfig.masterServer.port;
	this.path = gusxConfig.masterServer.path;

	this.start();
}

CMasterServer.prototype.start = function() {
	var that = this;

	this.server = new PeerServer({port: this.port, path: "/" + this.path});
	
	this.server.on("connection", function(id) { that.newConnection(id); });
	this.server.on("disconnect", function(id) { that.disconnection(id); });
}

CMasterServer.prototype.newConnection = function(id) {
	
}

CMasterServer.prototype.disconnection = function(id) {

}

exports.module = CMasterServer;