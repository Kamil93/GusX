CScriptTimerEvent = function(object, interval, delay) {
	CScriptEvent.call(this, object);

	this.interval = (interval === true);
	this.lastTime = this.currentTime();
	this.setDelay(delay);
}

CScriptTimerEvent.prototype = new CScriptEvent(); //extend

CScriptTimerEvent.prototype.setDelay = function(val) {
	this.delay = parseInt((val == 0) ? 1 : val);
}

CScriptTimerEvent.prototype.currentTime = function() {
	return (new Date()).getTime();
}

CScriptTimerEvent.prototype.check = function() {
	var curTime = this.currentTime();
	var diff = (curTime-this.lastTime);
	var count = diff / this.delay;
	count = count | count;
	
	if ( count > 0 ) {
		this.lastTime = curTime + (diff - count*this.delay);

		if ( !this.interval ) {
			this.run();
		
			var indexOf = this.object.events.timers.indexOf(this);
			if ( indexOf != -1 ) {
				this.object.events.timers.splice(indexOf, 1);
			}
		}
		else {
			for ( var i=0; i<count; i++ )
				this.run();
		}
	}
}