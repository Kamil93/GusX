CLineTest = function(map) {
	var that = this;
	
	this.map = map;
	
	this.displayContainer = new PIXI.DisplayObjectContainer();
	this.displayContainer.position = {x: 0, y: 0};
	this.map.gfx.addChild(this.displayContainer);
	
	this.w = 50;
	this.h = 50;
	this.size = 2;
	
	this.pixels = [];
	this.pixelsLight = [];
	
	this.generate();
	
	this.map.game.tools.log("Line test started");
}

CLineTest.prototype.generate = function(grid) {
	var that = this;

	for ( var y=0; y<this.h; y++ ) {
		for ( var x=0; x<this.w; x++ ) {	
			var box = this.map.game.tools.generateRectangle(x*this.size, y*this.size, this.size, this.size, 0xFFFFFF, 0xFFFFFF, 1, 1);
			this.displayContainer.addChild(box);
			this.pixels.push(box);
			
			var box2 = this.map.game.tools.generateRectangle(x*this.size, y*this.size, this.size, this.size, 0x000000, 0x000000, 1, 1);
			this.displayContainer.addChild(box2);
			this.pixelsLight.push(box2);
			box2.visible = false;
		}
	}
	
	//this.drawLine(0, 0, 50, 30);
	//this.plotLine(0, 0, 50, 30);
	this.drawCircle(25,25,20);
}

CLineTest.prototype.setPixel = function(x, y) {
	var index = y * this.w + x;
	
	this.pixels[index].visible = false;
	this.pixelsLight[index].visible = true;
}

CLineTest.prototype.plotLine = function(x0, y0, x1, y1) {
  step = 1;
  var step = step || 5,
      ctr = 0,
      dx =  Math.abs(x1-x0),
      sx = x0<x1 ? 1 : -1,
      dy = -Math.abs(y1-y0),
      sy = y0<y1 ? 1 : -1,
      err = dx+dy, e2,
      out = []; /* error value e_xy */

  for(;;){  /* loop */
    if (ctr++%step == 0)
       this.setPixel(x0, y0);

    if (x0==x1 && y0==y1) break;
    e2 = 2*err;
    if (e2 >= dy) { err += dy; x0 += sx; } /* e_xy+e_x > 0 */
    if (e2 <= dx) { err += dx; y0 += sy; } /* e_xy+e_y < 0 */
  }
}

CLineTest.prototype.drawLine = function(x1, y1, x2, y2)
{
    var dx = x2 - x1; var sx = 1;
    var dy = y2 - y1; var sy = 1;
    
    if (dx < 0)    {
        sx = -1;
        dx = -dx;
    }
    if (dy < 0)    {
        sy = -1;
        dy = -dy;
    }
    
    dx = dx << 1;
    dy = dy << 1;
    this.setPixel(x1, y1);
    if (dy < dx)
    {    
        var fraction = dy - (dx>>1);
        while (x1 != x2)
        {
            if (fraction >= 0)
            {
                y1 += sy;
                fraction -= dx;
            }
            fraction += dy;
            x1 += sx;
            this.setPixel(x1, y1);
        }
    } 
    else 
    {
        var fraction = dx - (dy>>1);        
        while (y1 != y2)
        {
            if (fraction >= 0)
            {
                x1 += sx;
                fraction -= dy;
            }
            fraction += dx;
            y1 += sy;
            this.setPixel(x1, y1);
        }    
    }
}

CLineTest.prototype.drawCircle = function(x1, y1, r) {
	var x=0,y=r,p=1-r;

	this.drawFragmentOfCircle(x1,y1,x,y);
	while(x<y) {
		x++;
		if(p<0)
			p+=2*x+1;
		else {
			y--;
			p+=2*(x-y)+1;
		}
		this.drawFragmentOfCircle(x1,y1,x,y);
	}
}
CLineTest.prototype.drawFragmentOfCircle = function(xctr,yctr,x,y) {
   this.setPixel(xctr +x,yctr +y,1);
   this.setPixel(xctr -x,yctr +y,1);
   this.setPixel(xctr +x,yctr -y,1);
   this.setPixel(xctr -x,yctr -y,1);
   this.setPixel(xctr +y,yctr +x,1);
   this.setPixel(xctr -y,yctr +x,1);
   this.setPixel(xctr +y,yctr -x,1);
   this.setPixel(xctr -y,yctr -x,1);
}