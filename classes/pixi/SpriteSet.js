PIXI.SpriteSet = function(object, texture, frameSize) {
	this.object = object;
	
	this.frameWidth = Math.floor(frameSize[0]);
	this.frameHeight = Math.floor(frameSize[1]);

	this.animFrameCount = Math.floor(texture.width / this.frameWidth);
	this.rotationFrameCount = Math.floor(texture.height / this.frameHeight);
	
	this.playing = true;
	this.loop = true;
	this.animRange = [-1, -1];
	this.animCurFrame = 0;
	this.animSpeed = 135; //co ile czasu zmienia klatkę
	this.animLastTime = (new Date()).getTime();
	
	this.rotationCurFrame = 0;
	
	this.textureRegions = new Array(this.animFrameCount * this.rotationFrameCount);
	
	var i = 0;
	for ( var y=0; y<this.rotationFrameCount; y++ ) {
		for ( var x=0; x<this.animFrameCount; x++ ) {
			this.textureRegions[i] = new PIXI.Texture( texture.baseTexture );
			this.textureRegions[i].setFrame({
				x: texture.frame.x + x * this.frameWidth,
				y: texture.frame.y + y * this.frameHeight,
				width: this.frameWidth,
				height: this.frameHeight
			});
			
			i++;
		}
	}

	PIXI.Sprite.call(this, this.textureRegions[0]);
}

PIXI.SpriteSet.prototype = Object.create(PIXI.Sprite.prototype);

PIXI.SpriteSet.prototype.getRangeEdge = function(x) {
	if ( this.animRange[x] == -1 ) {
		return x == 0 ? 0 : this.animFrameCount-1;
	}
	return this.animRange[x];
}

PIXI.SpriteSet.prototype.getRangeFrameCount = function() {
	return this.getRangeEdge(1) - this.getRangeEdge(0) + 1;
}

PIXI.SpriteSet.prototype.setPlaying = function(val) {
	if ( this.playing != val && val ) {
		this.animLastTime = (new Date()).getTime();
		this.animCurFrame = this.getRangeEdge(0);
		this.updateFrameFn();
	}

	this.playing = val;
}

PIXI.SpriteSet.prototype.start = function() {
	this.setPlaying(true);
}

PIXI.SpriteSet.prototype.stop = function() {
	this.setPlaying(false);
	this.animCurFrame = 0;
	this.updateFrameFn();
}

PIXI.SpriteSet.prototype.setAnimFrame = function(frame) {
	this.animCurFrame = Math.floor(frame);
	if ( this.animCurFrame < 0 ) this.animCurFrame = 0;
	else if ( this.animCurFrame >= this.animFrameCount ) this.animCurFrame = this.animFrameCount-1;
}

PIXI.SpriteSet.prototype.updateTransform = function() {
    PIXI.Sprite.prototype.updateTransform.call(this);
	
	var animUpdated = this.updateAnimation();
	var rotationUpdated = this.updateRotationFrame();
	
	if ( animUpdated || rotationUpdated ) {
		this.updateFrameFn();
	}
};

PIXI.SpriteSet.prototype.updateAnimation = function() {
    if( !this.playing || this.animFrameCount <= 1 || this.animSpeed <= 0 ) return false;
	
	var diffTime = ((new Date()).getTime()) - this.animLastTime;
	var framesForward = Math.floor(diffTime / this.animSpeed);
	
	if ( framesForward == 0 ) return false;

	this.animCurFrame += framesForward;
	this.animLastTime += framesForward * this.animSpeed;
	
	if ( this.animCurFrame > this.getRangeEdge(1) ) {
		if ( this.loop ) {
			var ratio = (this.animCurFrame - this.getRangeEdge(0)) / this.getRangeFrameCount();
			this.animCurFrame = this.getRangeEdge(0) + (ratio - Math.floor(ratio)) * this.getRangeFrameCount();
		}
		else {
			this.setPlaying(false);
			this.animCurFrame = 0;
		}
	}
	
	return true;
};

PIXI.SpriteSet.prototype.updateRotationFrame = function() {
	var angle = Math.abs(this.object.getAngle());
	
	var indexRange = 180 / this.rotationFrameCount;
	var currentRangeIndex = Math.floor(angle / indexRange);
	
	if ( currentRangeIndex >= this.rotationFrameCount ) currentRangeIndex = this.rotationFrameCount-1;

	if ( currentRangeIndex != this.rotationCurFrame )
		this.rotationCurFrame = currentRangeIndex;
	else
		return false;
	
	return true;
}

PIXI.SpriteSet.prototype.updateFrameFn = function() {
	this.setTexture(this.textureRegions[this.rotationCurFrame*this.animFrameCount + this.animCurFrame]);
}