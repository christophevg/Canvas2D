Canvas2D.CanvasBase = Class.create( Canvas2D.ICanvas, {
    initialize: function(element) {
	unless( element && element.nodeType && 
		element.nodeType == Node.ELEMENT_NODE, 
		function() {
		    alert( "CanvasBase:initialize: expected HTMLElement" );
		} );
	this.htmlcanvas = element;
	this.canvas = this.htmlcanvas.getContext("2d");

	this.lineWidth   = 1;
	this.strokeStyle = "black";
	this.fillStyle   = "black";
	this.font        = "10pt Sans-Serif";
    },
    
    save         : function() { 
	var oldValues = {};
	var currentValues = this;
	[ "lineWidth", "lineStyle", "strokeStyle", 
	  "fillStyle", "font", "textAlign" ].each(function(prop) {
	      oldValues[prop] = currentValues[prop];
	  } );
	this.oldValues = oldValues;
	this.canvas.save(); 
    },
    restore      : function() { 
	var oldValues = this.oldValues;
	var currentValues = this;
	[ "lineWidth", "lineStyle", "strokeStyle", 
	  "fillStyle", "font", "textAlign" ].each(function(prop) {
	      currentValues[prop] = oldValues[prop];
	  } );
	this.canvas.restore();
    },

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
