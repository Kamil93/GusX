window.gusx = null;

window.start = function() {	
	if ( conn_to_id != "host" ) window.gusx = new CClient(conn_to_id);
	else {
		window.gusx = new CBrowserHost();
	}

	window.gusx.run();
}

window.testo = function(text) {
	window.gusx.peerjs.broadcastEvent({type: "lol", text: text});
}