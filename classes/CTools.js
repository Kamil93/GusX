CTools = function(game) {
	this.game = game;
	
	this.lastSavedTime = 0;
}

CTools.prototype.log = function(str) {
	if ( typeof(str) == "object" ) str = JSON.stringify(str);
	if ( this.game.gusx.isBrowser() )
		$("div#log").prepend("<p>" + str + "</p>");
	else
		if ( console && console.log ) console.log(str);
}

CTools.prototype.randomInteger = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

CTools.prototype.currentTime = function() {
	return (new Date()).getTime();
}

CTools.prototype.saveTime = function() {
	this.lastSavedTime = this.currentTime();
}

CTools.prototype.elapsedTime = function() {
	return this.currentTime() - this.lastSavedTime;
}

CTools.prototype.createVector = function( angle, len ) {
	var rad_angle = this.degreesToRadians(angle-90);

	return {
		x: len * Math.cos(rad_angle),
		y: len * Math.sin(rad_angle)
	};
}

CTools.prototype.angleDegOfVector = function(x, y) {
	var angle = this.radiansToDegrees(Math.atan2(y, x))+90;

	return angle;
}

CTools.prototype.radiansToDegrees = function(radians) {
	return radians * (180 / Math.PI);
}

CTools.prototype.degreesToRadians = function(deg) {
	return deg * (Math.PI / 180);
}

CTools.prototype.lineDistance = function( x1, y1, x2, y2 )
{
	var xs = x2 - x1;
	var ys = y2 - y1;

	return Math.sqrt( (xs * xs) + (ys * ys) );
}

CTools.prototype.lineData = function( x1, y1, x2, y2 ) {
	var x2_odd_x1 = (x2-x1);
	var a = x2_odd_x1 == 0 ? 0 : (y2-y1) / x2_odd_x1;
	var b = y1 - (a * x1);
	return {a: a, b: b};
}

CTools.prototype.lineFindX = function( y, a, b ) {
	return (y-b)/a;
}

CTools.prototype.lineFindY = function( x, a, b ) {
	return a*x + b;
}

CTools.prototype.roundUpToNextPowerOfTwo = function(x) {
    x--;
    x |= x >> 1;  // handle  2 bit numbers
    x |= x >> 2;  // handle  4 bit numbers
    x |= x >> 4;  // handle  8 bit numbers
    x |= x >> 8;  // handle 16 bit numbers
    x |= x >> 16; // handle 32 bit numbers
    x++;
    
    return x;
}

CTools.prototype.isPolygonOverlapRectangle = function(poly, x, y, x2, y2) {
	//is rectangle any point in polygon
	if ( this.isPointInPolygon(x, y, poly) ) return true;	
	else if ( this.isPointInPolygon(x2, y, poly) ) return true;	
	else if ( this.isPointInPolygon(x2, y2, poly) ) return true;	
	else if ( this.isPointInPolygon(x, y2, poly) ) return true;	
	
	for ( var i=0; i<poly.length; i++ ) {
		var i2 = i+1;
		if ( i2 == poly.length ) i2 = 0; 
		
		if ( this.isPointInRectange(poly[i][0], poly[i][1], x, y, x2, y2) ) return true;
		else if ( this.IsLinesIntersect(x, y, x2, y, poly[i][0], poly[i][1], poly[i2][0], poly[i2][1]) ) return true;
		else if ( this.IsLinesIntersect(x2, y, x2, y2, poly[i][0], poly[i][1], poly[i2][0], poly[i2][1]) ) return true;
		else if ( this.IsLinesIntersect(x2, y2, x, y2, poly[i][0], poly[i][1], poly[i2][0], poly[i2][1]) ) return true;
		else if ( this.IsLinesIntersect(x, y2, x, y, poly[i][0], poly[i][1], poly[i2][0], poly[i2][1]) ) return true;
	}
	
	return false;
}

CTools.prototype.IsLinesIntersect = function(x1, y1, x2, y2, x3, y3, x4, y4) {
	var UBottom;
	var Ua, Ub;
	UBottom = ((y4-y3)*(x2-x1))-((x4-x3)*(y2-y1));
	if (UBottom != 0) {
		Ua = (((x4-x3)*(y1-y3))-((y4-y3)*(x1-x3)))/UBottom;
		Ub = (((x2-x1)*(y1-y3))-((y2-y1)*(x1-x3)))/UBottom;
		if ((Ua>=0) && (Ua<=1) && (Ub>=0) && (Ub<=1)) {
			return true;
		}
	}
	return false;
}

CTools.prototype.IsLinesIntersectEx = function(x1, y1, x2, y2, x3, y3, x4, y4) {
	var UBottom;
	var Ua, Ub;
	UBottom = ((y4-y3)*(x2-x1))-((x4-x3)*(y2-y1));
	if (UBottom != 0) {
		Ua = (((x4-x3)*(y1-y3))-((y4-y3)*(x1-x3)))/UBottom;
		Ub = (((x2-x1)*(y1-y3))-((y2-y1)*(x1-x3)))/UBottom;
		if ((Ua>=0) && (Ua<=1) && (Ub>=0) && (Ub<=1)) {
			var interceptX = x1+(Ua*(x2-x1));
			var interceptY = y1+(Ua*(y2-y1));
			return [interceptX, interceptY];
		}
	}
	return null;
}

CTools.prototype.isPointInPolygon = function(x, y, poly) {
	for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
		((poly[i][1] <= y && y < poly[j][1]) || (poly[j][1] <= y && y < poly[i][1]))
		&& (x < (poly[j][0] - poly[i][0]) * (y - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])
		&& (c = !c);
		
	return c;
}

CTools.prototype.isPointInRectange = function(x, y, x2, y2, x3, y3) {
	return !(x < x2 || x > x3 || y < y2 || y > y3 );
}

CTools.prototype.isRectInRect = function(x, y, x2, y2, x3, y3, x4, y4) {
	if (x > x4 || x3 > x2)
        return false;

    if (y > y4 || y3 > y2)
        return false;
		
	return true;
}

CTools.prototype.changeTwoRectSameSizeToPolygon = function(x,y,x2,y2, x3,y3,x4,y4) {
	if ( y < y3 ) {
		if ( x > x3 ) {
			return [[x,y], [x2,y], [x2,y2], [x4,y4], [x3,y4], [x3, y3]];
		}
		else if ( x < x3 ) {
			return [[x,y], [x2,y], [x4,y3], [x4,y4], [x3,y4], [x, y2]];
		}
		else {
			return [[x,y], [x2,y], [x4,y4], [x3, y4]];
		}
	}
	else if ( y > y3 ) {
		if ( x > x3 ) {
			return [[x3,y3], [x4,y3], [x2,y], [x2,y2], [x,y2], [x3, y4]];
		}
		else if ( x < x3 ) {
			return [[x3,y3], [x4,y3], [x4,y4], [x2,y2], [x,y2], [x, y]];
		}
		else {
			return [[x3,y3], [x4,y3], [x2,y2], [x,y2]];
		}
	}
	else {
		if ( x > x3 ) {
			return [[x3,y3], [x2,y], [x2,y2], [x3,y4]];
		}
		else if ( x < x3 ) {
			return [[x,y], [x4,y3], [x4,y4], [x,y2]];
		}
		else {
			return [[x,y], [x2,y], [x2,y2], [x,y2]];
		}
	}
}

CTools.prototype.BresenhamAlgorithm = function(x1, y1, x2, y2, pixel_fn) {
	var dx = x2 - x1; var sx = 1;
	var dy = y2 - y1; var sy = 1;

	if (dx < 0) {
		sx = -1;
		dx = -dx;
	}
	if (dy < 0) {
		sy = -1;
		dy = -dy;
	}

	dx = dx << 1;
	dy = dy << 1;
	if ( pixel_fn(x1, y1, true) ) return;
	if (dy < dx) {    
		var fraction = dy - (dx>>1);
		while (x1 != x2) {
			if (fraction >= 0) {
				y1 += sy;
				fraction -= dx;
			}
			fraction += dy;
			x1 += sx;
			if ( pixel_fn(x1, y1) ) return;
		}
	} 
	else {
		var fraction = dx - (dy>>1);        
		while (y1 != y2) {
			if (fraction >= 0) {
				x1 += sx;
				fraction -= dy;
			}
			fraction += dx;
			y1 += sy;
			if ( pixel_fn(x1, y1) ) return;
		}
	}
}

CTools.prototype.BresenhamAlgorithmCircle = function(x1, y1, r, extend) {
	var x=0,y=r,p=1-r;

	var arr = [];
	
	this.BresenhamAlgorithmCircleFragment(x1,y1,Math.round(x),Math.round(y), arr);

	while(x<y) {
		x++;
		if(p<0)
			p += 2*x+1;
		else {
			y--;
			p += 2*(x-y)+1;
		}
	
		this.BresenhamAlgorithmCircleFragment(x1,y1,Math.round(x),Math.round(y), arr);
	}
	
	if ( extend ) { //will sort it and store additional data
		for ( var i=0; i<arr.length; i++ ) {
			arr[i][2] = this.angleDegOfVector(arr[i][0]-x1, arr[i][1]-y1); //angle
		}
		arr.sort(function(a, b) {
			return a[2]-b[2];
		});
		
		var clearArr = [];
		var lastAngle = 1000;
		
		for ( var i=0; i<arr.length; i++ ) {
			if ( arr[i][2] != lastAngle ) {
				clearArr.push(arr[i]);
				lastAngle = arr[i][2];
			}
		}
		
		return clearArr;
	}
	
	return arr;
}

CTools.prototype.BresenhamAlgorithmCircleFragment = function(xctr,yctr,x,y, arr) {
	arr.push([xctr+x, yctr+y]);
	arr.push([xctr-x, yctr+y]);
	arr.push([xctr+x, yctr-y]);
	arr.push([xctr-x, yctr-y]);
	arr.push([xctr+y, yctr+x]);
	arr.push([xctr-y, yctr+x]);
	arr.push([xctr+y, yctr-x]);
	arr.push([xctr-y, yctr-x]);
}

// GFX

CTools.prototype.generateRectangle = function( x, y, width, height, backgroundColor, borderColor, borderWidth, alpha ) {
	if ( alpha === undefined ) alpha = 1;
	
	var box = new PIXI.Graphics();
	box.beginFill(backgroundColor, alpha);
	box.lineStyle(borderWidth , borderColor, alpha);
	box.drawRect(0, 0, width - borderWidth, height - borderWidth);
	box.endFill();
	box.position.x = x + borderWidth/2;
	box.position.y = y + borderWidth/2;
	return box;
};

CTools.prototype.generatePolygon = function( polygon, backgroundColor, borderColor, borderWidth ) { 
	var x = polygon[0][0];
	var y = polygon[0][1];
	
	var gfx = new PIXI.Graphics();
	gfx.beginFill(backgroundColor, 0.3);
	gfx.lineStyle(borderWidth , borderColor, 0.5);
	
	for ( var i=0; i<=polygon.length; i++ ) {
		var index = i;
		if ( index == polygon.length ) index = 0;
		gfx.lineTo(polygon[index][0] - x, polygon[index][1] - y);
	}
	
	gfx.endFill();
	
	gfx.position.x = x + borderWidth/2;
	gfx.position.y = y + borderWidth/2;
	return gfx;
}

CTools.prototype.generateLine = function( x, y, x2, y2, color, width, alpha ) { 
	if ( alpha === undefined ) alpha = 1;

	var gfx = new PIXI.Graphics();
	
	gfx.lineStyle(width , color, 1);
	gfx.moveTo(0, 0);
	gfx.lineTo(x2, y2);
	gfx.endFill();
	
	gfx.position.x = x;
	gfx.position.y = y;
	return gfx;
}

// node.js

CTools.prototype.getFileList = function(dir, files_) {
	files_ = files_ || [];
    if (typeof files_ === 'undefined') files_=[];
    var files = this.game.gusx.fs.readdirSync(dir);
    for(var i in files){
        if (!files.hasOwnProperty(i)) continue;
        var full_name = dir+'/'+files[i];
        if (this.game.gusx.fs.statSync(full_name).isDirectory()){
            getFiles(full_name,files_);
        } else {
            files_.push({
				full: full_name,
				dir: dir,
				file: files[i]
			});
        }
    }
    return files_;
}