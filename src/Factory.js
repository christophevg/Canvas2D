/**
 * Factory.js
 *
 * Author: Christophe VG & TheSoftwareFactory
 * http://thesoftwarefactory.be/wiki/Canvas2D
 *
 * License: http://thesoftwarefactory.be/wiki/BSD_License
 *
 * This factory takes a standard HTML5 Canvas element, adds (clearly
 * missing) features and tries to overcome the differences between
 * browsers implementations.
 *
 * The Factory extensions sub-namespace, contains sets of functionality
 * that need to be merged in. The sub-namespace "all" contains sets
 * that are merged in for all browsers. 
 */

Canvas2D.Factory = { extensions: { all: {} } };

/**
 * There are a few methods clearly missing on the HTML5 Canvas
 * element. This namespace adds a few utility methods that make life a
 * lot easier.
 */
Canvas2D.Factory.extensions.all.ShortHands = {
    clear: function clear() {
	this.clearRect( 0, 0, this.canvas.width, this.canvas.height );
    },

    fillTextCenter : function fillTextCenter(text, x, y, maxWidth) {
	var dx = this.measureText(text) / 2;
	this.fillText(text, x-dx, y, maxWidth);
    },

    fillTextRight : function fillTextRight(text, x, y, maxWidth) {
	var dx = this.measureText(text);
	this.fillText(text, x-dx, y, maxWidth);
    },

    strokeTextCenter : function strokeTextCenter(text, x, y, maxWidth) {
	var dx = this.measureText(text) / 2;
	this.strokeText(text, x-dx, y, maxWidth);
    },

    strokeTextRight : function strokeTextRight(text, x, y, maxWidth) {
	var dx = this.measureText(text);
	this.strokeText(text, x-dx, y, maxWidth);
    },

    fillStrokeRect : function fillStrokeRect(left, top, width, height) {
	this.fillRect( left, top, width, height );
	this.strokeRect( left, top, width, height );
    }
};

/**
 * This namespace adds basic event-handling supporting functions.
 */
Canvas2D.Factory.extensions.all.EventHandling = {
    on: function on( event, handler ) {
	if( !this.eventHandlers ) { this.eventHandlers = []; }
	if( !this.eventHandlers[event] ) { this.eventHandlers[event] = []; }
	this.eventHandlers[event].push(handler);
    },

    fireEvent: function fireEvent( event, data ) {
	if( !this.eventHandlers ) { return; }
	if( this.eventHandlers[event] ) {
	    this.eventHandlers[event].iterate( function(handler) { 
		handler(data);
	    } );
	}
    }
};

/**
 * We add some functionality, which also requires some additional
 * attributes, that are by default not part of the HTML5 Canvas spec. We
 * need to extend the some basic functionality to include these extended
 * properties.
 */

Canvas2D.Factory.extensions.all.ExtendedCanvasSupport = {
    __extend__: function __extend__(ctx) {
	var extProperties = [ "useCrispLines", "textDecoration", "lineStyle" ];

	var $superSave = ctx["save"];
	ctx["save"] = function() {
	    var oldValues = {};
	    var currentValues = this;
	    extProperties.iterate(function(prop) {
		oldValues[prop] = currentValues[prop];
	    });
	    if( !this.savedValues ) { this.savedValues = []; }
	    this.savedValues.push(oldValues);

	    $superSave.apply(this);
	};

	var $superRestore = ctx["restore"];
	ctx["restore"] = function() {
	    if( !this.savedValues ) { return; }

	    var oldValues = this.savedValues.pop();
	    var currentValues = this;
	    extProperties.iterate(function(prop) {
		currentValues[prop] = oldValues[prop];
	    });

	    $superRestore.apply(this);
	}

	return ctx;
    }
};

/**
 * The HTML5 specs did not specify dashed line support, because it is
 * said not to be trivial to implement natively ?! So we have to do it
 * ourselves!
 */
Canvas2D.Factory.extensions.all.DashedLineSupport = {
    __extend__: function __extend__(ctx) {
	[ "_setCurrentXY", "_plotPixel", "_drawLine" ].iterate( function(f) {
	    ctx[f] = Canvas2D.Factory.extensions.all.DashedLineSupport[f];
	});

	ctx.nativeMoveTo = ctx["moveTo"];
	ctx["moveTo"] = function(x,y) {
	    ctx.nativeMoveTo.apply( this, arguments );
	    this._setCurrentXY( x, y );
	}

	ctx.nativeLineTo = ctx["lineTo"];
	ctx["lineTo"] = function(x,y) {
	    if( this.lineStyle == "dashed" ) {
		this._drawLine( this.currentX, this.currentY, x, y );
	    } else {
		this.nativeLineTo.apply( this, arguments );
	    }
	    this._setCurrentXY(x, y);
	}

	return ctx;
    },

    _setCurrentXY: function _setCurrentXY(x, y) {
	if( !this.currentX ) { this.currentX = 0; }
	if( !this.currentY ) { this.currentY = 0; }
	this.currentX = x;
	this.currentY = y;
    },

    _plotPixel: function _plotPixel( x, y, c ) {
	var oldStyle = this.strokeStyle;
	this.beginPath();
	this.strokeStyle = c;
	this.fillStyle = c;
	this.moveTo(x,y);
	this.nativeLineTo(x+1,y+1);
	this.stroke();
	this.closePath();
	this.strokeStyle = oldStyle;
    },

    _drawLine: function _drawLine(x1, y1, x2, y2 ) {
	x1 = Math.floor(x1);	x2 = Math.floor(x2);
	y1 = Math.floor(y1-1);	y2 = Math.floor(y2-1);
	// to make sure other strokes are stroked:
	this.stroke();

	var c     = this.strokeStyle;
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

/**
 * Althought the HTML5 Canvas is a pixel-oriented environment, it still
 * uses anti-aliassing to smooth its drawings. I some cases this
 * default behaviour is not optimal (think horizontal/vertical
 * hairlines). This namspace adds support for crisp lines.
 */
Canvas2D.Factory.extensions.all.CrispLineSupport = {
    __extend__: function __extend__(ctx) {
	[ "strokeRect", "moveTo", "lineTo", "rect" ].iterate(function(f) {
	    var $super = ctx[f];
	    ctx[f] = function(x,y,w,h) {
		if(!this.useCrispLines) { return $super.apply(this,arguments); }
		var crisp = 
		    Canvas2D.Factory.extensions.all.CrispLineSupport.makeCrisp
		      (x,y,w,h,this.lineWidth);
		return $super.apply(this, [crisp.x, crisp.y, crisp.w, crisp.h]);
	    }
	});
	return ctx;
    },

    makeCrisp : function makeCrisp(x, y, xx, yy, lineWidth) {
	var x1 = x;  var y1 = y;
	var x2 = xx; var y2 = yy;
	var w  = xx; var h  = yy;

	// if the lineWidth is odd
	if( lineWidth % 2 ) {
	    x1 = Math.floor(x) + 0.5;
	    y1 = Math.floor(y) + 0.5;
	    if(typeof x2 != "undefined") {
		x2 = Math.floor(xx) + 0.5;
		y2 = Math.floor(yy) + 0.5;
	    }
	    // if the width/height is fractional
	    if( xx % 1 != 0 ) { w = Math.floor(xx); }
	    if( yy % 1 != 0 ) { h = Math.floor(yy); }
	} else {
	    x1 = Math.floor(x);
	    y1 = Math.floor(y);
	    if(typeof x2 != "undefined" ) {
		x2 = Math.floor(xx);
		y2 = Math.floor(yy);
	    }
	    // if the width/height is fractional
	    if( xx % 1 != 0 ) { w = Math.floor(xx) + 0.5; }
	    if( yy % 1 != 0 ) { h = Math.floor(yy) + 0.5; }
	}

	return {x:x1, y:y1, x1:x1, y1:y1, w:w, h:h, x2:x2, y2:y2};
    }
};

/**
 * The HTML5 Canvas provides no support for decorating text. So, this
 * namespace adds simple support for it.
 */
Canvas2D.Factory.extensions.all.TextDecorationSupport = {
    decorateText : function decorateText(text, x, y, maxWidth) {
	if( !this.textDecoration ) { return; }

	this.save();
	this.useCrispLines = true;
	this.strokeStyle = "black"; // TODO: this fixes red FF underlining
	this.textDecoration.toLowerCase().split(" ")
	                                 .iterate(function(decoration) {
	    var decorator = null;
	    switch(decoration) {
	    case "underline"   : decorator = this.underlineText;   break;
	    case "overline"    : decorator = this.overlineText;    break;
	    case "line-through": decorator = this.linethroughText; break;
	    }
	    if( decorator ) { 
		this.beginPath();
		var length = this.measureText(text);
		if( length > maxWidth ) { length = maxWidth; }
		decorator.call(this, text, x, y, length); 
		this.stroke();
		this.closePath();
	    }
	}.scope(this) );
	this.restore();
    },

    underlineText : function underlineText(text, x, y, length) {
        this.moveTo(x, y + 3);
        this.lineTo(x + length, y + 3);
    },

    overlineText : function overlineText(text, x, y, length) {
        this.moveTo(x, y - getFontSize(this.font) );
        this.lineTo(x + length, y - getFontSize(this.font) );
    },

    linethroughText : function linethroughText(text, x, y, length) {
        this.moveTo(x, y - (getFontSize(this.font) / 2) + 2);
        this.lineTo(x + length, y - (getFontSize(this.font) / 2) + 2);
    }
};

/**
 * We also want to add interaction with the Canvas. This namespace adds
 * basic mouse tracking and exposing of events to subscribers
 */
Canvas2D.Factory.extensions.all.MouseEvents = {
    setupMouseEventHandlers: function setupMouseEventHandlers() {
	ProtoJS.Event.observe(this.canvas, 'mousedown', 
		      this.handleMouseDown.scope(this));
	ProtoJS.Event.observe(this.canvas, 'mouseup', 
		      this.handleMouseUp.scope(this));
	ProtoJS.Event.observe(document, 'mousemove', 
		      this.handleMouseMove.scope(this));
	ProtoJS.Event.observe(this.canvas, 'dblclick',
		      this.handleDoubleClick.scope(this));
    },

    getLeft: function getLeft() {
	var elem = this.canvas;
	var left = 0;
	while( elem != null ) {
	    left += elem.offsetLeft;
	    elem = elem.offsetParent;
	}
	return left;
    },

    getTop: function getTop() {
	var elem = this.canvas;
	var top = 0;
	while( elem != null ) {
	    top += elem.offsetTop;
	    elem = elem.offsetParent;
	}
	return top;
    },

  getXY: function getXY(e) {
    var x,y;
    if( ProtoJS.Browser.IE ) {
      x = event.clientX + document.body.scrollLeft;
      y = event.clientY + document.body.scrollTop;
    } else {
      x = e.pageX;
      y = e.pageY;
    }
    return { x: x - this.getLeft(), y: y - this.getTop() };
  },
  
    handleMouseDown: function handleMouseDown(event) {
	this.mousepressed = true;
	var pos = this.getXY(event);
	this.fireEvent( "mousedown", pos );
	this.mousePos = pos;
    },

    handleMouseUp: function handleMouseUp(event) {
	this.mousepressed = false;
	var pos = this.getXY(event);
	this.fireEvent( "mouseup", pos );
	this.mousePos = pos;
    },

    handleMouseMove: function handleMouseMove(event) {
	    if( this.mousepressed ) { this.handleMouseDrag(event); }
	    var pos = this.getXY(event);
	    if( pos ) {
        var mouseWasOver = this.mouseOver;
	      this.mouseOver = ( pos.x >= 0 && pos.x <= this.canvas.width )
	                   &&  ( pos.y >= 0 && pos.y <= this.canvas.height );
		    if(this.mouseOver && !mouseWasOver) { this.fireEvent( "mouseEnter" );}
	      if(!this.mouseOver && mouseWasOver) { this.fireEvent( "mouseLeave" );}
	    }
    },
    
    handleMouseDrag: function handleMouseDrag(event) {
	var pos = this.getXY(event);
	this.fireEvent( "mousedrag", { x: pos.x, 
				       y: pos.y, 
				       dx: pos.x - this.mousePos.x,
				       dy: pos.y - this.mousePos.y } );
	this.mousePos = pos;
    },

    handleDoubleClick: function handleDoubleClick(event) {
      var pos = this.getXY(event);
      this.fireEvent( "dblclick", pos );
      this.mousePos = pos;
    }
};

/**
 * The iPhone has special events for touching and dragging.
 */
Canvas2D.Factory.extensions.TouchEvents = {
    setupTouchEventHandlers: function setupTouchEventHandlers() {
	ProtoJS.Event.observe(this.canvas, 'touchstart',
			      this.handleTouchStart.scope(this));
	ProtoJS.Event.observe(this.canvas, 'touchmove',
			      this.handleTouchMove.scope(this));
	ProtoJS.Event.observe(this.canvas, 'touchend',
			      this.handleTouchEnd.scope(this));
    },

    handleTouchStart: function handleTouchStart(event) {
	if( event.touches.length == 1 ) {
	    this.handleMouseDown(event.touches[0]);
	    event.preventDefault();
	}	
    },

    handleTouchMove: function handleTouchMove(event) {
	if( event.touches.length == 1 ) {
	    this.handleMouseDrag(event.touches[0]);
	    event.preventDefault();
	}	
    },

    handleTouchEnd: function handleTouchEnd(event) {
	this.handleMouseUp(event);
	event.preventDefault();
    }
};

/**
 * The HTML5 Canvas specification specifies functions for rendering
 * text. Currently only recent FF implementations provide an
 * implementation for these functions.
 *
 * Different browsers have different custom support for rendering
 * text. This namespace provides common functions for our
 * implementation.
 */
Canvas2D.Factory.extensions.all.TextSupport = {
    adjustToAlignment: function adjustToAlignment(x, text) {
	switch(this.textAlign) {
	  case "center": x -= this.measureText(text) / 2; break;
	  case "right":  x -= this.measureText(text);     break;
	}
	return x;
    },

    getFontSize: function() {
	return getFontSize( this.font || Canvas2D.Sheet.Defaults.font );
    }
};

/**
 * The HTML5 Canvas specification specifies functions for rendering
 * text. Currently only recent FF implementations provide an
 * implementation for these functions.
 *
 * For browsers that have no support at all, we render text using small
 * lines. We use the canvastext library by Jim Studt.
 */
Canvas2D.Factory.extensions.CanvasText = {
    fillText : function fillText(text, x, y, maxWidth) {
	// CanvasText implementation is stroke-based, no filling, just stroking
	this.strokeText(text, x, y, maxWidth);
    },
    
    strokeText : function strokeText(text, x, y, maxWidth) {
    	this.beginPath();
	
    	this.save();
	// CanvasText implementation is stroke-based. Just in case the
	// fillStyle is set in stead of strokeStyle
	this.strokeStyle = this.fillStyle;
	x = this.adjustToAlignment(x, text);
	CanvasTextFunctions.draw(this, this.font, getFontSize(this.font), 
				 x, y, text);
	this.decorateText(text, x, y, maxWidth);
	this.restore();

	this.closePath();
    },
    
    measureText  : function measureText(text) {
	return CanvasTextFunctions.measure( this.font, getFontSize(this.font), 
					    text);
    }
};

/**
 * The HTML5 Canvas specification specifies functions for rendering
 * text. Currently only recent FF implementations provide an
 * implementation for these functions.
 *
 * Even with HTML5 compliant text rendering functions, we still want to
 * add some missing functionalities like text-alignment and
 * text-decoration.
 */
Canvas2D.Factory.extensions.HTML5CanvasText = {
    __extend__: function __extend__(ctx) {
	var $superMeasureText = ctx["measureText"];
	ctx["measureText"] = function measureText(text) {
	    return $superMeasureText.apply(this, arguments).width;
	}

	var $superFillText = ctx["fillText"];
	ctx["fillText"] = function fillText(text, x, y, maxWidth) {
	    maxWidth = maxWidth  || this.measureText(text);
            $superFillText.apply(this, arguments);
	    x = this.adjustToAlignment( x, text );	    
            this.decorateText(text, x, y, maxWidth);
	}

	var $superStrokeText = ctx["strokeText"];
	ctx["strokeText"] = function strokeText(text, x, y, maxWidth) {
	    maxWidth = maxWidth  || this.measureText(text);
            $superStrokeText.apply(this, arguments);
	    x = this.adjustToAlignment( x, text );
            this.decorateText(text, x, y, maxWidth);
	}

	return ctx;
    }
};

/**
 * The HTML5 Canvas specification specifies functions for rendering
 * text. Currently only recent FF implementations provide an
 * implementation for these functions.
 *
 * This implementation should be used for pre Gecko 1.9.1.  Later
 * versions of Gecko should use HTML5CanvasText, which wraps the native
 * HTML5 text rendering functions.
 */
Canvas2D.Factory.extensions.GeckoCanvasText = {
    fillText     : function fillText(text, x, y, maxWidth) {
	x = this.adjustToAlignment(x, text);
        this._drawText(text, x, y, true);
        this.decorateText(text, x, y, maxWidth);
    },

    strokeText   : function strokeText(text, x, y, maxWidth) {
	x = this.adjustToAlignment(x, text);
        this._drawText(text, x, y, false);
        this.decorateText(text, x, y, maxWidth);
    },

    measureText  : function measureText(text) {
        this.save();
        this.mozTextStyle = this.font;
        var width = this.mozMeasureText(text);
        this.restore();
        return width;
    },

    /**
     * Helper function to stroke text.
     * @param {DOMString} text The text to draw into the context
     * @param {float} x The X coordinate at which to begin drawing
     * @param {float} y The Y coordinate at which to begin drawing
     * @param {boolean} fill If true, then text is filled, 
     * 			otherwise it is stroked  
     */
    _drawText : function _drawText(text, x, y, fill) {
        this.save();

        this.beginPath();
        this.translate(x, y);
        this.mozTextStyle = this.font;
        this.mozPathText(text);
        if (fill) {
            this.fill();
        } else {
            this.stroke();
        }
        this.closePath();

        this.restore();
    }
};

/**
 * This is the main Factory method. It takes a native Canvas 2D Context
 * and transforms it into a Canvas2D.
 */
Canvas2D.Factory.setup = function(element) {
    if( !Canvas2D.initialized ) {
	Canvas2D.initialized = true;
	// prepare Canvas Prototype
	if (!window.CanvasRenderingContext2D) {   // webkit
	    window.CanvasRenderingContext2D =
		document.createElement("canvas").getContext("2d").__proto__;
	} else {   // firefox
	    window.CanvasRenderingContext2D = CanvasRenderingContext2D.prototype
	}
    }

    unless( element && element.nodeType &&
	    element.nodeType == 1,
	    function() {
		throw( "CanvasBase:initialize: expected HTMLElement" );
	    } );
    
    try {
	var ctx = element.getContext("2d");    
    } catch(e) {
	throw( "Canvas2D: element is no HTML5 Canvas." );
    }

    // TextFunctions are problematic ;-)
    // it took a while before all major browser supported the text functions
    if( ctx.strokeText && ctx.fillText && ctx.measureText ) {
      // standard native functions are present, extend them a bit further
      ctx = Canvas2D.Factory.extensions.HTML5CanvasText.__extend__(ctx);
    } else if( ctx.mozMeasureText && ctx.mozPathText ) {
      // pre 1.9 gecko suports own interface (<= FF 3.1)
      ProtoJS.mix(Canvas2D.Factory.extensions.GeckoCanvasText, ctx, true );
    } else {
      // browser has no native text functions, use CanvasText to simulate it
      ProtoJS.mix( Canvas2D.Factory.extensions.CanvasText, ctx, true );
      if( ProtoJS.Browser.IE ) {
        // IE already uses an emulation layer (explorercanvas)
        // which is slow, so we disable the additional watermark text
        Canvas2D.Book.prototype.addWaterMark = function() { };
      }
    }	

    // Additional Browser Specific Configuration
    if( ProtoJS.Browser.MobileSafari ) { 
      ProtoJS.mix( Canvas2D.Factory.extensions.TouchEvents, ctx, true );
      ctx.setupTouchEventHandlers();
    }

    // mixin some functions that clearly are missing ;-)
    $H(Canvas2D.Factory.extensions.all).values().iterate(function(ext) {
	if( ext.__extend__ ) {
	    ctx = ext.__extend__(ctx);
	} else {
	    ProtoJS.mix( ext, ctx, true );
	}
    } );

    // initialize own default settings
    $H(Canvas2D.Defaults.Canvas).iterate(function(key, value) {
	ctx[key] = value;
    });

    // activate mouseEventHandlers
    ctx.setupMouseEventHandlers();

    return ctx;
}

// mix-in event handling to Canvas2D
ProtoJS.mix( Canvas2D.Factory.extensions.all.EventHandling, Canvas2D );
