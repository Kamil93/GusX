CScriptAction = function(name, fn, args) {
	if ( typeof(fn) != "function" ) return;

	this.name = name;
	this._function = fn;
	this._params = typeof(args) == "object" ? args : null;
}

CScriptAction.prototype.run = function(object) {
	if ( this._params === null )
		this._function.call(object);
	else
		this._function.apply(object, this._params);
}