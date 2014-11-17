CShapeParticleSensor = function(object, type, name, x, y) {
	CShapeBox.call(this, object, type, name, x, y, 1, 1);
}

CShapeParticleSensor.prototype = new CShapeBox();