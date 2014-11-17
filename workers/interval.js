var interval = null;
var interval_step = 0;

self.onmessage = function(e) {
	var data = e.data.split(";");
	
	var event_name = data[0];
	
	if ( event_name == "start" ) {
		interval_step = parseInt(data[1]);
		
		inverval = setInterval(function() {
			self.postMessage("tick");
		}, interval_step);
		
		self.postMessage("started");
	}
	else if ( event_name == "stop" ) {
		if ( interval !== null ) {
			clearInterval(interval);
			self.postMessage("stoped");
			interval = null;
		}
	}
};