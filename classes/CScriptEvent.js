CScriptEvent = function(object) {
	this.object = object;
	this.actions = [];
}

CScriptEvent.prototype.addActions = function(actions) {
	if ( !actions.length ) return false;

	for ( var i=0; i<actions.length; i++ ) {
		if ( typeof(actions[i]) == "string" ) this.addAction(actions[i].split(/[\s,;]+/));
	}
	
	return true;
}

CScriptEvent.prototype.addAction = function(args) {
	var action_name = args[0];
	args = args.slice(1);
	
	var newAction = null;
	
	if ( action_name == "remove" ) {
		newAction = new CScriptAction(action_name, this.object.addToRemove);
	}
	else if ( action_name == "velocity" ) {
		newAction = new CScriptAction(action_name, this.object.setVelocity, [
			parseFloat(args[0]), parseFloat(args[1])
		]);
	}
	else if ( action_name == "apply_force" ) {
		newAction = new CScriptAction(action_name, this.object.applyForce, [
			parseFloat(args[0]), parseFloat(args[1])
		]);
	}
	
	if ( newAction !== null ) this.actions.push(newAction);
}

CScriptEvent.prototype.run = function() {
	for ( var i=0; i<this.actions.length; i++ ) {
		this.actions[i].run(this.object);
	}
}