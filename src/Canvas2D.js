if( typeof Prototype == "undefined" ) {
    alert( "Canvas2D requires the Prototype JS library." );
} else if( !window.CanvasRenderingContext2D ) {
    alert( "Could not find CanvasRenderingContext2D. " +
	   "If you're using IE, ExplorerCanvas is required." );
} else if( typeof CanvasTextFunctions == "undefined" ) {
    alert( "Canvas2D requires the CanvasText implementation." );
}

var Canvas2D = {};

Canvas2D.Canvas = Class.create( {
    dynamic    : false,
    wait       : false,
    canvas     : null,
    htmlcanvas : null,
    console    : null,
    shapes:    [],
    eventHandlers : new Hash(),

    currentX    : 0,
    currentY    : 0,
    lineWidth   : 1,
    lineStyle   : "solid",
    strokeStyle : "black",
    fillStyle   : "black",
    
    initialize: function(id) {
	this.dynamic = false;
	this.wait = false;
	this.shapes = new Array();

	this.currentX    = 0;
	this.currentY    = 0;
	this.lineWidth   = 1;
	this.lineStyle   = "solid";
	this.strokeStyle = "black";
	this.fillStyle   = "black";

	// setup HTML5 canvas
	this.htmlcanvas = document.getElementById(id);
	this.wireCanvas();

	// look for a console for this canvas
	this.console = document.getElementById( id+"Console" );

	this.eventHandlers = new Hash();
    },

    wireCanvas: function() {
	if( this.htmlcanvas ) {
	    this.canvas = this.htmlcanvas.getContext('2d');
	}

	// attach eventhandlers for mouse events
	Event.observe(this.htmlcanvas, 'mousedown', 
		      this.handleMouseDown.bindAsEventListener(this));
	Event.observe(this.htmlcanvas, 'mouseup', 
		      this.handleMouseUp.bindAsEventListener(this));
	Event.observe(this.htmlcanvas, 'mousemove', 
		      this.handleMouseMove.bindAsEventListener(this));
	// add textfunctions
	CanvasTextFunctions.enable(this.canvas);
    },

    makeDynamic: function() {
	this.dynamic = true;
    },

    makeStatic: function() {
	this.dynamic = false;
    },

    getAboutTab: function(height) {
	var tab = document.createElement("div");
	tab.className = "tabbertab";
	tab.style.height = height + 4;
	var head = document.createElement("h2");
	var txt = document.createTextNode("About");
	head.appendChild(txt);
	tab.appendChild(head);
	var about = document.createElement("div");
	about.style.border = "2px solid #ccc";
	about.style.height = height;
	about.style.overflow = "auto";
	about.innerHTML = '<span class="about"><b>Canvas2D</b><br>&copy 2009, '+
	    '<a href="http://christophe.vg" target="_blank">Christophe VG</a>'+ 
	    ' & <a href="http://thesoftwarefactory.be" ' +
	    'target="_blank">The Software Factory</a><br>' + 
	    'Visit <a href="http://thesoftwarefactory.be/wiki/Canvas2D" ' +
	    'target="_blank">http://thesoftwarefactory.be/wiki/Canvas2D</a> ' +
	    'for more info. Licensed under the ' +
	    '<a href="http://thesoftwarefactory.be/wiki/BSD_License" ' + 
	    'target="_blank">BSD License</a>.</span>';
	tab.appendChild(about);
	return tab;
    },

    // TODO: this is ugly, try to find a better solution
    makeTabbed: function() {
	var source = this.htmlcanvas;
	var tabber = document.createElement("div");
	tabber.className="tabber";
	tabber.style.width = ( parseInt(source.width) + 17 );
	tabber.style.height = ( parseInt(source.height) + 37 );
	var tab1 = document.createElement("div");
	tab1.className = "tabbertab";
	var h1 = document.createElement("h2");
	var t1 = document.createTextNode("Diagram");
	h1.appendChild(t1);
	tab1.appendChild(h1);
	var newCanvas = document.createElement("canvas");
	newCanvas.id = source.id;
	newCanvas.className = source.className;
	newCanvas.width = source.width;
	newCanvas.height = source.height;
	this.canvas = this.htmlcanvas.getContext("2d");
	tab1.appendChild(newCanvas);
	tabber.appendChild(tab1);
	tabber.appendChild(this.getAboutTab(source.height));
	source.parentNode.replaceChild(tabber, source);
	// apply excanvas to new element
	try {
	    this.htmlcanvas = G_vmlCanvasManager.initElement(newCanvas);
	} catch(err) {
	    this.htmlcanvas = newCanvas;	   
	}
	tabberAutomatic(); // activate Tabber
	this.wireCanvas(); // rewire Canvas2D events,...
	this.render();     // force rerender
    },

    on: function( event, handler ) {
	this.eventHandlers[event] = handler;
    },

    fireEvent: function( event, data ) {
	if( this.eventHandlers[event] ) {
	    this.eventHandlers[event](data);
	}
    },

    log: function( msg ) {
	if( this.console ) {
	    this.console.value = msg + "\n" + this.console.value;
	}
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
            return { x:event.pageX - this.getLeft(), 
		     y:event.pageY - this.getTop()  };
	}
	return null;
    },

    getShapeAt: function(x,y) {
	for( var s = this.shapes.length-1; s>=0; s-- ) {
	    if( this.shapes[s].hit(x,y) ) {
		return this.shapes[s];
	    }
	}
	return null;
    },

    getShapesIn: function(left, top, width, height) {
	alert( "Canvas2D.Canvas::getShapesIn: not implemented yet" );
    },

    handleMouseDown: function(event) {
	if( !this.dynamic ) { return; }
	this.mousepressed = true;
	var pos = this.getXY(event);
	this.currentShape = this.getShapeAt( pos.x, pos.y );
	this.fireEvent( "selectShape", this.currentShape.getProperties() );
	this.currentPos = pos;
	this.render();
    },

    handleMouseUp: function(event) {
	if( !this.dynamic ) { return; }
	this.mousepressed = false;
	if( this.currentShape ) {
	    var pos = this.currentShape.getPosition();
	    this.log( "canvas2d: shape moved to " + pos.left + ", " + pos.top );
	} else {
	    this.showSelection = false;
	    this.render();
	}
    },

    handleMouseMove: function(event) {
	if( !this.dynamic ) { return; }
	if( this.mousepressed ) {
	    this.handleMouseDrag(event);
	}
    },

    handleMouseDrag: function(event) {
	if( !this.dynamic ) { return; }
	var pos = this.getXY(event);
	if( this.currentShape ) {
	    var dx = pos.x - this.currentPos.x;
	    var dy = pos.y - this.currentPos.y;
	    this.currentShape.move( dx, dy );
	    this.currentPos = pos;
	} else {
	    this.showSelection = true;
	    this.selectionPos  = pos;
	    this.render();
	}
    },

    at: function(left, top) {
	this.newTop = top;
	this.newLeft = left;
	return this;
    },

    put: function(shape) {
	shape.setPosition(this.newLeft, this.newTop);
	this.shapes.push( shape );
	shape.setCanvas(this);
	this.render();
	this.log( "canvas2d: added shape @" + this.newLeft + "," +this.newTop);
	return shape;
    },

    clearRect: function(x, y, w, h ) {
	this.canvas.clearRect( x, y, w, h );
    },

    fillRect: function(x, y, w, h ) {
	this.canvas.fillStyle = this.fillStyle;
	this.canvas.fillRect( x, y, w, h );
    },

    strokeRect: function(x, y, w, h ) {
	this.canvas.strokeStyle = this.strokeStyle;
	this.canvas.strokeRect( x, y, w, h );
    },

    beginPath: function() {
	this.canvas.beginPath();
    },

    closePath: function() {
	this.canvas.closePath();
    },

    stroke: function() {
	this.canvas.strokeStyle = this.strokeStyle;
	this.canvas.lineWidth = this.lineWidth;
	this.canvas.stroke();
    },

    fill: function() {
	this.canvas.fillStyle = this.fillStyle;
	this.canvas.fill();
    },

    moveTo: function(x,y) {
	this.canvas.moveTo( x, y );
	this.currentX = x;
	this.currentY = y;
    },

    lineTo: function(x,y) {
	if( this.lineStyle == "dashed" ) {
	    this._drawLine( this.currentX, this.currentY, x, y );
	} else {
	    this.canvas.lineTo( x, y );
	}
	this.currentX = x;
	this.currentY = y;
    },

    measureText: function(font, size, text) {
	return this.canvas.measureText( font, size, text );
    },

    drawTextCenter: function(font, size, left, top, text) {
	this.canvas.strokeStyle = this.strokeStyle;
	this.canvas.drawTextCenter(font, size, left, top, text);
    },

    drawText: function(font, size, left, top, text) {
	this.canvas.strokeStyle = this.strokeStyle;
	this.canvas.drawText(font, size, left, top, text);
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
    },
    
    freeze: function() {
	this.wait = true;
    },

    thaw: function() {
	this.wait = false;
	this.render();
    },

    clear: function() {
	this.shapes = new Array();
	this.currentSelection = false;
	this.currentShape = null;
	this.fireEvent( "selectShape", {} );
    },

    addWaterMark: function() {
	this.strokeStyle = "rgba(0,0,0,0.50)";
	this.canvas.rotate(3.1415/2);
	this.drawText( "Sans", 6, 3, (this.htmlcanvas.width * -1) + 7, 
		       "Canvas2D / Christophe VG" ); 
    },

    addSelectionOverlay: function() {
	if( this.showSelection ) { 
	    var pos = this.selectionPos;
	    var dx = pos.x - this.currentPos.x;
	    var dy = pos.y - this.currentPos.y;
	    
	    this.canvas.fillStyle = "rgba( 0, 0, 255, 0.10 )";
	    this.canvas.fillRect( pos.x <= this.currentPos.x ? 
				  pos.x : this.currentPos.x, 
				  pos.y <= this.currentPos.y ?
				  pos.y : this.currentPos.y,
				  Math.abs(dx), Math.abs(dy) );
	}
    },

    addSelectionMarkers: function() {
	if( this.currentShape ) {
	    var box = this.currentShape.getBox();
	    this.canvas.fillStyle = "rgba( 200, 200, 255, 1 )";
	    var corners = [[ box.left, box.top    ], [ box.right, box.top    ],
		           [ box.left, box.bottom ], [ box.right, box.bottom ]];
	    var canvas = this.canvas;
	    corners.each( function(corner) {
		canvas.beginPath();
		canvas.arc( corner[0],  corner[1], 5, 0, Math.PI*2, true );
		canvas.fill();	
	    } );
	}
    },

    render: function() {
	if(  this.wait   ) { return; }
	if( !this.canvas ) { return; }

	this.canvas.clearRect( 0, 0, 
			       this.htmlcanvas.width, 
			       this.htmlcanvas.height );
	
	this.shapes.each(function(shape) { shape.render(); } );
	this.addSelectionMarkers();
	this.addSelectionOverlay();
	this.addWaterMark();

	this.dirty = false;
    }
} );
