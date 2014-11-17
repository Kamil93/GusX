CMap.prototype.materialDataInit = function(game) {
	var that = this;

	this.BITS_PER_PIXEL_IN_MASK = 2;

	this.NOT_AIR_PIXEL = -1;
	
	this.AIR_PIXEL = 0;
	this.ROCK_PIXEL = 1;
	this.DIRT_PIXEL = 2;
	this.SEMI_ROCK_PIXEL = 3;
	
	//------------------------------------------------------
	
	this.materialArraySize = 0;
	this.materialArray = null;
	this.materialWidthOfRow = 0;
	
	this.grid = null;

	//------------------------------------------------------
}

CMap.prototype.initializeMapSize = function(w, h) {
	this.width = w;
	this.height = h;
	
	this.materialArraySize = this.width*this.height*this.BITS_PER_PIXEL_IN_MASK;
	this.materialArray = new BitSet(this.materialArraySize, 0);
	
	this.materialWidthOfRow = this.width*this.BITS_PER_PIXEL_IN_MASK;
}

CMap.prototype.loadMaterial = function(done_fn) {
	var that = this;

	var filename = "assets/maps/" + this.game.mapName + "/material.png";
	
	if ( this.game.gusx.isBrowser() == false ) {
		return this.loadMaterial_nodejs(filename, done_fn);
	}
	
	var image = new Image();
	image.src = filename;
	image.onload = function() {
		var canvas_buffer = document.createElement("canvas");
		canvas_buffer.width = image.width;
		canvas_buffer.height = image.height;
		var context = canvas_buffer.getContext("2d");
		
		context.drawImage(image, 0, 0);
		
		that.initializeMapSize(image.width, image.height);
		
		imageData = context.getImageData(0, 0, image.width, image.height).data;
		
		for ( var i=0; i<imageData.length; i+=4 ) {
			var pixelIndex = Math.floor(i / 4);
			var y = Math.floor(pixelIndex / image.width);
			var x = pixelIndex - (y * image.width);
		
			that.loadMaterialDefinePixel(x, y, imageData[i], imageData[i+1], imageData[i+2]);
		}
		
		done_fn(true);
	}
	image.onerror = function() {
		that.game.tools.log("CMap.loadMapMaterial(): loading file failed");
		done_fn(false);
	}
}

CMap.prototype.loadMaterial_nodejs = function(filename, done_fn) {
	var that = this;

	this.game.gusx.getPixels(filename, function(err, pixels) {
		if(err) {
			done_fn(false);
			return;
		}
		
		var material_info = pixels.shape.slice();

		that.initializeMapSize(material_info[1], material_info[0]);
		
		for ( var y=0; y<material_info[0]; y++ ) {
			for ( var x=0; x<material_info[1]; x++ ) {
				that.loadMaterialDefinePixel(x, y, pixels.get(y, x, 0), pixels.get(y, x, 1), pixels.get(y, x, 2));
			}
		}

		done_fn(true);
	});
}

CMap.prototype.loadMaterialDefinePixel = function(x, y, r, g, b) {
	if ( r==255 && g==255 && b==255 ) this.setPixelStateAt(x, y, this.AIR_PIXEL);
	else if ( r==0 && g==0 && b==0 ) this.setPixelStateAt(x, y, this.ROCK_PIXEL);
	else this.setPixelStateAt(x, y, this.AIR_PIXEL);
}

CMap.prototype.createGrid = function() {
	if ( this.materialArray === null ) return;
	
	var highestGridSize = this.game.tools.roundUpToNextPowerOfTwo(Math.max(this.width, this.height));
	this.game.tools.log("Grid size based on: " + this.width + " and " + this.height + " is " + highestGridSize);
	
	this.grid = new CGrid(0, 0, this, highestGridSize, null);
}

CMap.prototype.setPixelStateAt = function(x, y, state) {
	var index = y*this.materialWidthOfRow + x * this.BITS_PER_PIXEL_IN_MASK;
	
	if ( x < 0 || x >= this.width || y < 0 || y >= this.height ) return this.ROCK_PIXEL; 
	
	if ( index < 0 || index >= this.materialArraySize ) {
		this.game.tools.log("CMap.setPixelStateAt(): something goes wrong, index is out of range.");
		return this.ROCK_PIXEL;
	}
	
	if ( state == this.AIR_PIXEL ) {
		this.materialArray.set(index, 0);
		this.materialArray.set(index+1, 0);
	}
	else if ( state == this.SEMI_ROCK_PIXEL ) {
		this.materialArray.set(index, 0);
		this.materialArray.set(index+1, 1);
	}
	else if ( state == this.DIRT_PIXEL ) {
		this.materialArray.set(index, 1);
		this.materialArray.set(index+1, 0);
	}
	else { //this.ROCK_PIXEL
		this.materialArray.set(index, 1);
		this.materialArray.set(index+1, 1);
	}
}

CMap.prototype.getPixelStateAt = function(x, y) {
	x = Math.round(x);
	y = Math.round(y);

	var index = y*this.materialWidthOfRow + x * this.BITS_PER_PIXEL_IN_MASK;

	if ( x < 0 || x >= this.width || y < 0 || y >= this.height ) return this.ROCK_PIXEL; 
	
	if ( index < 0 || index >= this.materialArraySize ) {
		return this.ROCK_PIXEL;
	}
	
	var bit1 = this.materialArray.get(index);
	var bit2 = this.materialArray.get(index+1);
	
	if ( bit1 == 0 && bit2 == 0 ) return this.AIR_PIXEL;
	else if ( bit1 == 0 && bit2 == 1 ) return this.SEMI_ROCK_PIXEL;
	else if ( bit1 == 1 && bit2 == 0 ) return this.DIRT_PIXEL;
	else return this.ROCK_PIXEL; //11
}

CMap.prototype.getPixelSimpleStateAt = function(x, y) {
	//x = Math.round(x);
	//y = Math.round(y);

	if ( x < 0 || x >= this.width || y < 0 || y >= this.height ) return this.NOT_AIR_PIXEL;
	
	var index = y*this.materialWidthOfRow + x * this.BITS_PER_PIXEL_IN_MASK;
	
	if ( index < 0 || index >= this.materialArraySize ) {
		return this.NOT_AIR_PIXEL;
	}
	
	var bit1 = this.materialArray.get(index);
	var bit2 = this.materialArray.get(index+1);
	
	if ( !bit1 && !bit2 ) return this.AIR_PIXEL;
	return this.NOT_AIR_PIXEL;
}

CMap.prototype.getMaterialLineSimpleStateAt = function(x, y, w) {
	//x = Math.round(x);
	//y = Math.round(y);

	if ( x + w >= this.width ) w = (this.width-1) - x;
	if ( x < 0 || x + w >= this.width || y < 0 || y >= this.height ) {
		return this.NOT_AIR_PIXEL;
	}
	
	var index = y*this.materialWidthOfRow + x * this.BITS_PER_PIXEL_IN_MASK;
	
	if ( index < 0 || index + (w * this.BITS_PER_PIXEL_IN_MASK) >= this.materialArraySize ) {
		return this.NOT_AIR_PIXEL;
	}
	
	while ( w > 0 ) {	
		var bit1 = this.materialArray.get(index);
		var bit2 = this.materialArray.get(index+1);
		
		if ( !bit1 && bit2 ) return this.NOT_AIR_PIXEL;
		else if ( bit1 && !bit2 ) return this.NOT_AIR_PIXEL;
		else if ( bit1 && bit2 ) return this.NOT_AIR_PIXEL; //11
		
		w--;
		index += 2;
	}
	
	return this.AIR_PIXEL;
}

CMap.prototype.getMaterialVerticalLineSimpleStateAt = function(x, y, h) {
	//x = Math.round(x);
	//y = Math.round(y);

	if ( y + h >= this.height ) h = (this.height-1) - y;
	if ( x < 0 || x >= this.width || y < 0 || y+h >= this.height ) {
		return this.NOT_AIR_PIXEL;
	}
	
	var index = y*this.materialWidthOfRow + x * this.BITS_PER_PIXEL_IN_MASK;
	
	if ( index < 0 || index + (h * this.materialWidthOfRow) >= this.materialArraySize ) {
		return this.NOT_AIR_PIXEL;
	}
	
	while ( h > 0 ) {	
		var bit1 = this.materialArray.get(index);
		var bit2 = this.materialArray.get(index+1);
		
		if ( !bit1 && bit2 ) return this.NOT_AIR_PIXEL;
		else if ( bit1 && !bit2 ) return this.NOT_AIR_PIXEL;
		else if ( bit1 && bit2 ) return this.NOT_AIR_PIXEL; //11
		
		h--;
		index += this.materialWidthOfRow;
	}
	
	return this.AIR_PIXEL;
}

CMap.prototype.getMaterialBoxSimpleStateAt = function(x, y, w, h) {
	for ( var i=0; i<h; i++ ) {
		if ( this.getMaterialLineSimpleStateAt(x, y+i, w) == this.NOT_AIR_PIXEL ) return this.NOT_AIR_PIXEL;
	}
	return this.AIR_PIXEL;
}