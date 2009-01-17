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
	if( this.htmlcanvas ) {
	    this.canvas = this.htmlcanvas.getContext('2d');
	}
	// look for a console for this canvas
	this.console = document.getElementById( id+"Console" );

	// attach eventhandlers for mouse events
	Event.observe(this.htmlcanvas, 'mousedown', 
		      this.handleMouseDown.bindAsEventListener(this));
	Event.observe(this.htmlcanvas, 'mouseup', 
		      this.handleMouseUp.bindAsEventListener(this));
	Event.observe(this.htmlcanvas, 'mousemove', 
		      this.handleMouseMove.bindAsEventListener(this));
	// add textfunctions
	CanvasTextFunctions.enable(this.canvas);

	this.eventHandlers = new Hash();
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
	this.mousepressed = true;
	var pos = this.getXY(event);
	//this.log( "mousedown " + pos.x + ", " + pos.y );
	this.currentShape = this.getShapeAt( pos.x, pos.y );
	this.fireEvent( "selectShape", this.currentShape.getProperties() );
	this.currentPos = pos;
	this.render();
    },

    handleMouseUp: function(event) {
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
	if( this.mousepressed ) {
	    this.handleMouseDrag(event);
	}
    },

    handleMouseDrag: function(event) {
	var pos = this.getXY(event);
	//this.log( "mousedrag " + pos.x + ", " + pos.y );
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
	//this.log( "dot( " + x + ", " + y + " )" );
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

	//this.log( "line( " + x1 + ", "+ y1 + ", "+ x2 + ", "+ y2 +")" );

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

    render: function() {
	if(  this.wait   ) { return; }
	if( !this.canvas ) { return; }

	//this.log( "render" );
	this.canvas.clearRect( 0, 0, 
			       this.htmlcanvas.width, 
			       this.htmlcanvas.height );
	// draw all shapes
	this.shapes.each(function(shape) { shape.render(); } );
	
	// mark surrounding box of currently selected shape
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
	
	// selection overlay
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
	this.dirty = false;
    }
} );
    
Canvas2D.Shape = Class.create( {
    initialize: function( props ) {
	this.props = props;
    },

    getProperties: function() {
	return { type: "Shape",
		 left: this.props.left,
		 top: this.props.top,
		 width: this.props.width,
		 height: this.props.height };
    },

    setCanvas: function( canvas2d ) {
	this.canvas = canvas2d;
    },

    setPosition: function( left, top ) {
	this.props.left = left;
	this.props.top  = top;
	this.forceRedraw();
    },

    forceRedraw: function() {
	if(!this.canvas) { return; };
	this.canvas.render();
    },

    getPosition: function() {
	return { left: this.props.left, 
		 top : this.props.top };
    },

    move: function( dleft, dtop ) {
	this.props.left += dleft;
	this.props.top  += dtop;
	this.canvas.fireEvent( "selectShape", this.getProperties() );
	this.forceRedraw();
    },

    // the remaining methods are not applicable for abstract shapes
    getBox    : function() { return null; },
    render    : function() { },
    hit       : function(x,y) { return false; },
    hitArea   : function(left, top, width, height) { return false; },
    getCenter : function() { return null; },
    getPort   : function(side) { }
} );

Canvas2D.Rectangle = Class.create( Canvas2D.Shape, {
    render: function() {
	this.canvas.beginPath(); 
	this.canvas.strokeStyle = this.props.color;
	this.canvas.strokeRect( this.props.left,  this.props.top, 
			        this.props.width, this.props.height );
    },

    hit: function(x,y) {
	return ( this.props.left <= x &&
		 this.props.left + this.props.width >= x && 
		 this.props.top  <= y &&
		 this.props.top + this.props.height >= y ); 
    },

    hitArea: function(left, top, width, height) {
	alert( "Canvas2D.Rectangle::hitArea: not implemented yet" );
    },

    getCenter: function() {
	return { top:  this.props.top  + (this.props.height/2),
		 left: this.props.left + (this.props.width/2) };
    },

    getBox: function() {
	return { top: this.props.top,
		 left: this.props.left,
		 bottom: this.props.top + this.props.height,
		 right: this.props.left + this.props.width,
	         height: this.props.height,
		 width: this.props.width };
    },

    getPort: function(side) {
	switch(side) {
	case "n":
	case "north":
	    return { top: this.props.top, 
		     left: this.props.left + (this.props.width/2) };
	    break;
	case "s":
	case "south":
	    return { top: this.props.top + this.props.height, 
		     left: this.props.left + (this.props.width/2) };
	    break;
	case "e":
	case "east":
	    return { top: this.props.top + (this.props.height/2), 
		     left: this.props.left + this.props.width };
	    break;
	case "w":
	case "west":
	    return { top: this.props.top + (this.props.height/2), 
		     left: this.props.left };
	    break;
	}
    }
} );

Canvas2D.Connector = Class.create( Canvas2D.Shape, {
    defaults: { color: "black", 
		lineStyle: "solid",
		width: 2, 
		begin: null, 
		end: null },

    initialize: function($super, from, to, props) {
	$super(props || {});
	this.from = from;
	this.to   = to;
    },

    render: function() {
	this.canvas.strokeStyle = this.props.color || this.defaults.color;
	this.canvas.lineWidth   = this.props.width || this.defaults.width; 
	this.canvas.lineStyle   = this.props.lineStyle 
	    || this.defaults.lineSstyle; 
	
	this.canvas.beginPath();
	switch( this.props.style ) {
	  case "vertical":    this._vertical();    break;
	  case "horizontal":  this._horizontal();  break;
	  case "direct":      default: this._direct();
	}
	this.canvas.stroke();
    },

    _direct: function() {
	var from, to;
	// TODO add connector
	// TODO intersection with border
	from = this.from.getCenter();
	to   = this.to.getCenter();
	this.canvas.moveTo(from.left, from.top);
	this.canvas.lineTo(to.left,   to.top);
    },

    draw_connector: function(shape, port, left, top) {
	var left = left || shape.getPort(port).left;
	var top  = top  || shape.getPort(port).top;
	
	this.canvas.moveTo(left, top);

	var connector = null;
	if( shape == this.from && this.props.begin ) {
	    connector = this.props.begin[port];
	}
	if( shape == this.to && this.props.end ) {
	    connector = this.props.end[port];
	}

	if( connector ) {
	    var oldStyle = this.canvas.lineStyle;
	    this.canvas.lineStyle = "solid";
	    this.canvas.stroke();
	    this.canvas.beginPath();
	    this.canvas.moveTo(left, top);
	    var canvas = this.canvas;
	    connector.lines.each(function(d){
		if(d == "fill") {
		    canvas.fillStyle = "rgba( 0, 0, 0, 1 )";
		    canvas.fill();
		} else {
		    canvas.lineTo(left + d[0], top + d[1]);
		}
	    });
	    this.canvas.stroke();
	    this.canvas.beginPath();
	    this.canvas.lineStyle = oldStyle;
	    this.canvas.moveTo(left + connector.end[0], top + connector.end[1]);
	}
    },

    minTreeDist: 30,
    minCornerDist : 15,

    initialBranchLength: function(top, bottom) {
	return ( bottom - top ) / 2;
    },

    _vertical: function() {
	var top, bottom;
	if( this.from.getBox().top < this.to.getBox().top ) {
	    top    = this.from;  bottom = this.to;
	} else {
	    top    = this.to;    bottom = this.from;
	}

	if( bottom.getBox().top - top.getBox().bottom >= this.minTreeDist ) {
	    this._vertical_tree( top, bottom );
	} else if( bottom.getCenter().top - top.getBox().bottom 
		   >= this.minCornerDist) {  
	    this._vertical_corner( top, bottom );
	} else {
	    this._vertical_line(this.from, this.to);
	}
    },

    _vertical_tree: function( top, bottom ) {
	this.draw_connector(top, "s");

	var src = top.getPort("s");
	var trg = bottom.getPort("n");
	var dy1 = this.initialBranchLength( src.top, trg.top );

	this.canvas.lineTo(src.left, src.top + dy1);
	this.canvas.lineTo(trg.left, src.top + dy1);
	this.draw_connector( bottom, "n" );
	this.canvas.lineTo(trg.left, src.top + dy1);
    },

    _vertical_corner: function(top, bottom) {
	this.draw_connector( top, "s" );

	var src = top.getPort("s");
	var trgPort = src.left < bottom.getPort("w").left ? "w" : "e";
	var trg = bottom.getPort(trgPort);
	
	this.canvas.lineTo( src.left, trg.top );
	
	this.draw_connector( bottom, trgPort );
	this.canvas.lineTo(src.left, trg.top);
    },

    _vertical_line: function(from, to) {
	var fromPort, toPort;
	if( from.getBox().right < to.getBox().left ) {
	    fromPort = "e"; toPort = "w";
	} else {
	    fromPort = "w"; toPort = "e";
	}

	var y = from.getPort(fromPort).top -
	    ( ( from.getPort(fromPort).top - to.getPort(toPort).top ) / 2 );
	var dx = (to.getPort(toPort).left - from.getPort(fromPort).left ) / 2;

	this.draw_connector( from, fromPort, null, y );
	this.canvas.lineTo( from.getPort(fromPort).left+dx, y);
	this.draw_connector( to,   toPort,   null, y );
	this.canvas.lineTo( from.getPort(fromPort).left+dx, y);
    },

    _horizontal: function() {
	var left, right;
	if( this.from.getBox().left < this.to.getBox().left ) {
	    left  = this.from; right = this.to;
	} else {
	    left  = this.to;   right = this.from;
	}

	if( right.getBox().left - left.getBox().right >= this.minTreeDist ) {
	    this._horizontal_tree( left, right );
	} else if( right.getCenter().left - left.getBox().right 
		   >= this.minCornerDist) {  
	    this._horizontal_corner( left, right );
	} else {
	    this._horizontal_line(this.from, this.to);
	}
    },

    _horizontal_tree: function( left, right ) {
	this.draw_connector(left, "e");

	var src = left.getPort("e");
	var trg = right.getPort("w");
	var dx1 = this.initialBranchLength( src.left, trg.left );

	this.canvas.lineTo(src.left + dx1, src.top);
	this.canvas.lineTo(src.left + dx1, trg.top);

	this.draw_connector( right, "w" );
	this.canvas.lineTo(src.left + dx1, trg.top);
    },

    _horizontal_corner: function(left, right) {
	this.draw_connector( right, "w" );

	var src = right.getPort("w");
	var trgPort = src.top < left.getPort("n").top ? "n" : "s";
	var trg = left.getPort(trgPort);
	
	this.canvas.lineTo( trg.left, src.top );
	
	this.draw_connector( left, trgPort );
	this.canvas.lineTo(trg.left, src.top);
    },

    _horizontal_line: function(from, to) {
	var fromPort, toPort;
	if( from.getBox().bottom < to.getBox().top ) {
	    fromPort = "s"; toPort = "n";
	} else {
	    fromPort = "n"; toPort = "s";
	}

	var x = from.getPort(fromPort).left -
	    ( ( from.getPort(fromPort).left - to.getPort(toPort).left ) / 2 );
	var dy = (to.getPort(toPort).top - from.getPort(fromPort).top ) / 2;

	this.draw_connector( from, fromPort, x );
	this.canvas.lineTo( x, from.getPort(fromPort).top+dy);

	this.draw_connector( to,   toPort,   x );
	this.canvas.lineTo( x, from.getPort(fromPort).top+dy);
    },

    hit: function(x,y) {
	// connectors aren't selectable (for now ;-))
	return false;
    },

    hitArea: function(left, top, width, height) {
	// connectors aren't selectable ("en mass")
	return false;
    }

} );

