PIXI.OccFilter = function(light)
{
    PIXI.AbstractFilter.call( this );
 
	this.light = light;
 
    this.passes = [this];
	
	this.testLineForMax = 500;

	var material = this.light.parent.manager.parent.textures.material;
	
	this.uniforms = {
		"pos": {type: "2i", value: {x:0, y:0}},
		"size": {type: "2i", value: {x:0, y:0}},
		"msize": {type: "2f", value: {x:material.width, y:material.height}},
		"material": {type: "sampler2D", value: material}
	};
 
    this.fragmentSrc = [
		"#version 100",
		
		"precision lowp float;",
		"varying vec2 vTextureCoord;",
		"uniform sampler2D uSampler;",

		"uniform ivec2 pos;",
		"uniform ivec2 size;",
		"uniform sampler2D material;",
		"uniform vec2 msize;",
		
		"vec4 wallcolor = vec4(0, 0, 0, 1);",
		
		"vec4 colorAt(float x, float y) {",
		"	return texture2D(material, vec2((x+0.5)/msize.x, (y+0.5)/msize.y));",
		"}",
		
		"bool isColorAt(float x, float y) {",
		"	if ( colorAt(x, y) == wallcolor ) return true;",
		"	return false;",
		"}",
		
		"bool testLine(float x1, float y1, float x2, float y2) {",
		"	if ( x1 == x2 && y1 == y2 ) return true;",
		
		"	float dx = float(x2 - x1); float sx = 1.0;",
		"	float dy = float(y2 - y1); float sy = 1.0;",

		"	if (dx < 0.0) {",
		"		sx = -1.0;",
		"		dx = -dx;",
		"	}",
		"	if (dy < 0.0) {",
		"		sy = -1.0;",
		"		dy = -dy;",
		"	}",

		"	dx = dx * 2.0;",
		"	dy = dy * 2.0;",
		"	if ( isColorAt(x1, y1) ) return false;",
		"	if (dy < dx) {    ",
		"		float fraction = (dy) - ((dx)/2.0);",
		"		for ( int i=0; i<" + this.testLineForMax + "; i++ ) {",
		"			if (x1 == x2) break;",
		"			if (fraction >= 0.0) {",
		"				y1 += sy;",
		"				fraction -= (dx);",
		"			}",
		"			fraction += (dy);",
		"			x1 += sx;",
		"			if ( isColorAt(x1, y1) ) return false;",
		"		}",
		"	} ",
		"	else {",
		"		float fraction = (dx) - ((dy)/2.0);",
		"		for ( int i=0; i<" + this.testLineForMax + "; i++ ) {",
		"			if (y1 == y2) break;",
		"			if (fraction >= 0.0) {",
		"				x1 += sx;",
		"				fraction -= (dy);",
		"			}",
		"			fraction += (dx);",
		"			y1 += sy;",
		"			if ( isColorAt(x1, y1) ) return false;",
		"		}",
		"	}",
		
		"	return true;",
		"}",
			
		"void main(void) {",
		"   vec2 pixel = vec2(gl_FragCoord.x, gl_FragCoord.y);",
		"   vec4 color = texture2D(uSampler, vTextureCoord);",
		
		"	if ( testLine(float(pos.x+size.x/2), float(pos.y+size.y/2), floor(pixel.x), floor(pixel.y)) == false ) color.a = 0.0;",
		"   gl_FragColor = color;",
		"}"
    ];
};

PIXI.OccFilter.prototype = Object.create( PIXI.AbstractFilter.prototype );
PIXI.OccFilter.prototype.constructor = PIXI.OccFilter;

PIXI.OccFilter.prototype.onUpdate = function() {
	this.uniforms.pos.value = {
		x: Math.round(this.light.position.x - (this.light.anchor.x * this.light.width)),
		y: Math.round(this.light.position.y - (this.light.anchor.y * this.light.height))
	};
	
	this.uniforms.size.value = {
		x: Math.round(this.light.width),
		y: Math.round(this.light.height)
	};
}