Canvas2D.Factory = {};

Canvas2D.Factory.extensions = {};

Canvas2D.Factory.extensions.ShortHands = {
    clear: function() {
	this.canvas.clearRect( 0, 0, 
			       this.htmlcanvas.width, 
			       this.htmlcanvas.height );
    },

    fillTextCenter : function(text, x, y, maxWidth) {
	var dx = this.measureText(text) / 2;
	this.fillText(text, x-dx, y, maxWidth);
    },
    fillTextRight : function(text, x, y, maxWidth) {
	var dx = this.measureText(text);
	this.fillText(text, x-dx, y, maxWidth);
    },

    strokeTextCenter : function(text, x, y, maxWidth) {
	var dx = this.measureText(text) / 2;
	this.strokeText(text, x-dx, y, maxWidth);
    },
    strokeTextRight : function(text, x, y, maxWidth) {
	var dx = this.measureText(text);
	this.strokeText(text, x-dx, y, maxWidth);
    }
};

Canvas2D.Factory.extensions.EventHandling = {
    on: function( event, handler ) {
	if( !this.eventHandlers ) { this.eventHandlers = []; }
	this.eventHandlers[event] = handler;
    },

    fireEvent: function( event, data ) {
	if( !this.eventHandlers ) { return; }
	if( this.eventHandlers[event] ) {
	    this.eventHandlers[event](data);
	}
    }
};

Canvas2D.Factory.extensions.DashedLineSupport = {
    setCurrentXY: function( x, y) {
	if( !this.currentX ) { this.currentX = 0; }
	if( !this.currentY ) { this.currentY = 0; }
	this.currentX = x;
	this.currentY = y;
    },

    moveTo: function(x,y) {
	this.canvas.moveTo( x, y );
	this.setCurrentXY( x, y );
    },

    lineTo: function(x,y) {
	if( !this.lineStyle ) { this.lineStyle = "solid"; }
	if( this.lineStyle == "dashed" ) {
	    this._drawLine( this.currentX, this.currentY, x, y );
	} else {
	    this.canvas.lineTo( x, y );
	}
	this.setCurrentXY(x, y);
    },

    _plotPixel: function( x, y, c ) {
	with( this.canvas ) {
	    var oldStyle = strokeStyle;
	    beginPath();
	    strokeStyle = c;
	    moveTo(x,y);
	    lineTo(x+1,y+1);
	    stroke();
	    closePath();
	    strokeStyle = oldStyle;
	}
    },

    _drawLine: function(x1, y1, x2, y2 ) {
	x1 = Math.floor(x1);
	x2 = Math.floor(x2);
	y1 = Math.floor(y1-1);
	y2 = Math.floor(y2-1);
	// to make sure other strokes are stroked:
	this.canvas.stroke();

	var c = this.strokeStyle;
	var style = this.lineStyle;

	var steep = Math.abs(y2 - y1) > Math.abs(x2 - x1);
	if (steep) {
            t = y1;            y1 = x1;            x1 = t;
            t = y2;            y2 = x2;            x2 = t;
	}
	var deltaX = Math.abs(x2 - x1);
	var deltaY = Math.abs(y2 - y1);
	var error = 0;
	var deltaErr = deltaY;
	var xStep;
	var yStep;
	var x = x1;
	var y = y1;
	if(x1 < x2) {  xStep = 1; } else { xStep = -1; }
	if(y1 < y2) {  yStep = 1; } else { yStep = -1;	}
	if( steep ) { this._plotPixel(y, x, c); } 
	else        { this._plotPixel(x, y, c); }
	var dot = 0;
	while( x != x2 ) {
            x = x + xStep;
            error = error + deltaErr;
            if( 2 * error >= deltaX ) {
		y = y + yStep;
		error = error - deltaX;
            }
	    var color = ( style != "dashed" || ++dot % 15 ) < 10 ? c : "white";
            if(steep) { this._plotPixel(y, x, color); } 
	    else      { this._plotPixel(x, y, color); }
	}
    }

};

Canvas2D.Factory.extensions.MouseEvents = {
    initialize: function($super, element) {
	$super(element);
	this.setupMouseEventHandlers();
    },

    setupMouseEventHandlers: function() {
	Event.observe(this.htmlcanvas, 'mousedown', 
		      this.handleMouseDown.bindAsEventListener(this));
	Event.observe(this.htmlcanvas, 'mouseup', 
		      this.handleMouseUp.bindAsEventListener(this));
	Event.observe(document, 'mousemove', 
		      this.handleMouseMove.bindAsEventListener(this));
    },

    getLeft: function() {
	var elem = this.htmlcanvas;
	var left = 0;
	while( elem != null ) {
	    left += elem.offsetLeft;
	    elem = elem.offsetParent;
	}
	return left;
    },

    getTop: function() {
	var elem = this.htmlcanvas;
	var top = 0;
	while( elem != null ) {
	    top += elem.offsetTop;
	    elem = elem.offsetParent;
	}
	return top;
    },

    getXY: function(event) {
	if( event == null ) { event = window.event; }
	if( event == null ) { return null;          }
	if( event.pageX || event.pageY ) {
            return { x: event.pageX - this.getLeft(), 
		     y: event.pageY - this.getTop()  };
	}
	return null;
    },

    handleMouseDown: function(event) {
	this.mousepressed = true;
	var pos = this.getXY(event);
	this.fireEvent( "mousedown", pos );
	this.mousePos = pos;
    },

    handleMouseUp: function(event) {
	this.mousepressed = false;
	var pos = this.getXY(event);
	this.fireEvent( "mouseup", pos );
	this.mousePos = pos;
    },

    handleMouseMove: function(event) {
	if( this.mousepressed ) { this.handleMouseDrag(event); }
	var pos = this.getXY(event);
	if( pos ) {
	    this.mouseOver = 
		( pos.x >= 0 && pos.x <= this.htmlcanvas.width )
		&&  
		( pos.y >= 0 && pos.y <= this.htmlcanvas.height );
	}
    },

    handleMouseDrag: function(event) {
	var pos = this.getXY(event);
	this.fireEvent( "mousedrag", { x: pos.x, 
				       y: pos.y, 
				       dx: pos.x - this.mousePos.x,
				       dy: pos.y - this.mousePos.y } );
	this.mousePos = pos;
    }
};
    
Canvas2D.Factory.setup = function(element) {
    var canvas = null;

    if( Prototype.Browser.WebKit ) { canvas = Canvas2D.WebKitCanvas; }
    if( Prototype.Browser.Gecko )  { canvas = Canvas2D.GeckoCanvas;  }
    if( Prototype.Browser.IE )     { canvas = Canvas2D.IECanvas;     }
    if( Prototype.Browser.Opera ) {
	throw( "Factory::setup: Opera support is currently disabled." );
    }
    if( Prototype.Browser.MobileSafari ) {
	throw( "Factory::setup: MobileSaferi support is currently disabled." );
    }

    if( canvas == null ) {
	throw( "Factory::setup: unknown browser." );
    }

    // mixin some functions that clearly are missing ;-)
    $H(Canvas2D.Factory.extensions).values().each(function(ext) {
	canvas = Class.create( canvas, ext );
    } );

    return new canvas(element);
};
