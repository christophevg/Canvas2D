Canvas2D.GeckoCanvas = Class.create( Canvas2D.ICanvas, {
    initialize: function(element) {
	unless( element instanceof HTMLElement, function() {
	    throw( "GeckoCanvas:initialize: element should be HTMLElement" );
	} );
	this.htmlcanvas = element;
	this.canvas = this.htmlcanvas.getContext("2d");
	
	this.lineWidth   = 1;
	this.strokeStyle = "black";
	this.fillStyle   = "black";
    },
    
    save         : function() { this.canvas.save(); },
    restore      : function() { this.canvas.restore(); },
    
    scale        : function(x,y) { this.canvas.scale(x,y); },
    rotate       : function(angle) { this.canvas.rotate(angle); },
    translate    : function(x, y) { this.canvas.translate(x,y); },
    transform    : function(m11, m12, m21, m22, dx, dy) {
	this.canvas.transform(m11, m12, m21, m22, dx, dy);
    },
    setTransform : function(m11, m12, m21, m22, dx, dy) {
	this.canvas.setTransform(m11, m12, m21, m22, dx, dy);
    },
    
    createLinearGradient : function(x0, y0, x1, y1) {
	return this.canvas.createLinearGradient(x0, y0, x1, y1);
    },
    createRadialGradient : function(x0, y0, r0, x1, y1, r1) {
	return this.canvas.createRadialGradient(x0, y0, r0, x1, y1, r1);
    },
    createPattern        : function(image, repetition) {
	return this.canvas.createPattern(image, repitition);
    },
   
    clearRect  : function(x, y, w, h) { this.canvas.clearRect(x, y, w, h); },
    fillRect   : function(x, y, w, h) { 
	this.canvas.fillStyle = this.fillStyle;
	this.canvas.fillRect (x, y, w, h); 
    },
    strokeRect : function(x, y, w, h) { 
	this.canvas.strokeStyle = this.strokeStyle;
	this.canvas.lineWidth   = this.lineWidth || 1;
	this.canvas.strokeRect(x, y, w, h ); 
    },
    
    beginPath        : function() { this.canvas.beginPath(); },
    closePath        : function() { this.canvas.closePath(); },
    moveTo           : function(x, y) { this.canvas.moveTo(x,y); },
    lineTo           : function(x, y) { this.canvas.lineTo(x, y); },
    quadraticCurveTo : function(cpx, cpy, x, y) { 
	this.canvas.quadraticCurveTo( cpx, cpy, x, y );
    },
    bezierCurveTo    : function(cp1x, cp1y, cp2x, cp2y, x, y) {
	this.canvas.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    },
    arcTo            : function(x1, y1, x2, y2, radius) {
	this.canvas.arcTo(x1, y1, x2, y2, radius);
    },
    rect             : function(x, y, w, h) {
	this.canvas.rect(x, y, w, h);
    },
    arc              : function(x, y, radius, startAng, endAng, anticlockwise) {
	this.canvas.arc(x, y, radius, startAng, endAng, anticlockwise);
    },
    fill             : function() {
	this.canvas.fillStyle = this.fillStyle;
	this.canvas.fill();
    },
    stroke           : function() {
	this.canvas.strokeStyle = this.strokeStyle;
	this.canvas.lineWidth   = this.lineWidth || 1;
	this.canvas.stroke();
    },
    clip             : function() {
	this.canvas.clip();
    },
    isPointInPath    : function(x, y) {
	return this.canvas.isPointInPath(x, y);
    },

    fillText     : function(text, x, y, maxWidth) {
    	if (!this.canvas.fillText) {
    		// fallback to pre Gecko 1.9.1 text rendering
    		this.drawText(text, x, y, true);
    	} else {
    		this.canvas.font = this.font;
    		this.canvas.fillText(text, x, y, maxWidth);
    	}
    },
    strokeText   : function(text, x, y, maxWidth) {
    	if (!this.canvas.strokeText) {
    		// fallback to pre Gecko 1.9.1 text rendering
    		this.drawText(text, x, y, false);
    	} else {
    		this.canvas.font = this.font;
    		this.canvas.strokeText(text, x, y, maxWidth);
    	}
    },
    measureText  : function(text) {
    	this.save();
    	if (!this.canvas.measureText) {
    		// fallback to pre Gecko 1.9.1 text measuring
    		this.canvas.mozTextStyle = this.font;
    		return this.canvas.mozMeasureText(text);
    	} else {
    		this.canvas.font = this.font;
    		return this.canvas.measureText(text);
    	}
    	this.restore();
    },

    /**
     * Helper function to stroke text.
     * @param {DOMString} text The text to draw into the context
     * @param {float} x The X coordinate at which to begin drawing
     * @param {float} y The Y coordinate at which to begin drawing
     * @param {boolean} fill If true, then text is filled, 
     * 			otherwise it is stroked  
     */
    drawText : function(text, x, y, fill) {
    	this.save();
    	
    	this.beginPath();
    	this.translate(x, y);
    	this.canvas.mozTextStyle = this.font;
    	this.canvas.mozPathText(text);
    	if (fill) {
    	    this.fill();
    	} else {
    	    this.stroke();
    	}
    	this.closePath();
    	
    	this.restore();
    },

    drawImage : function(image, x, y ) { 
	this.canvas.drawImage( image, x, y );
    },

    createImageData : function(sw, sh) {
	return this.canvas.createImageData(sw, sh);
    },
    getImageData    : function(sx, sy, sw, sh) {
	return this.canvas.getImageData(sx, sy, sw, sh);
    },
    putImageData    : function(imagedata, dx, dy, 
			       dirtyX, dirtyY, dirtyWidth, dirtyHeight) 
    {
	this.canvas.putImageData( imagedata, dx, dy, 
				  dirtyX, dirtyY, dirtyWidth, dirtyHeight );
    }
} );