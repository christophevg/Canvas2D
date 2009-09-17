Canvas2D.Position = Class.extend( {
    init: function( shape, left, top ) {
	this.shape = shape;
	this.left  = left || null;
	this.top   = top  || null;
    },

    toADL: function(prefix) {
	var loc = "";
	if( this.left != null && this.top != null ) {
	    loc = prefix + "[@" + this.left + "," + this.top + "]\n";
	}
	return loc + this.shape.toADL(prefix);
    },

    getLeft: function() { return this.left; },
    getTop : function() { return this.top;  },

    getWidth : function() { return this.shape.getWidth();  },
    getHeight: function() { return this.shape.getHeight(); },
    
    getCenter: function() { 
	var center = this.shape.getCenter();
	center.left += this.left;
	center.top += this.top;
	return center;
    },

    getBox: function() {
	return { left  : this.left, 
		 right : this.left + this.shape.getWidth(),
		 top   : this.top,
		 bottom: this.top  + this.shape.getHeight() };
    },

    getPort: function(port) {
	var port = this.shape.getPort(port);
	port.left += this.left;
	port.top  += this.top;
	return port;
    },

    render: function( sheet ) {
	this.shape.render( sheet, this.left, this.top );
    },

    move: function( dleft, dtop ) {
	this.left += dleft;
	this.top  += dtop;
	this.fireEvent( "change", 
			"from " + this.left - dleft + "," + this.top - dtop +
			" to " + this.left + "," + this.top );
    },

    getName: function() {
	return this.shape.getName();
    },

    hit: function(x,y) {
	var rx = x - this.left;
	var ry = y - this.top;
	if( rx < 0 || ry < 0 ) { return false; }
	return this.shape.hit(rx, ry);
    },

    hitArea: function(left, top, right, bottom) {
	var rleft   = left   - this.left;
	var rtop    = top    - this.top;
	var rright  = right  - this.left;
	var rbottom = bottom - this.top;
	return this.shape.hitArea(min(rleft,rright), 
				  min(rtop,rbottom), 
				  max(rleft,rright), 
				  max(rtop,rbottom));

    },

    delayRender: function() {
	return this.shape.delayRender();
    }
});

ProtoJS.mix( Canvas2D.Factory.extensions.all.EventHandling,
	     Canvas2D.Position.prototype );
