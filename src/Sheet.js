Canvas2D.Sheet = Class.create( {
    style         : "static",                // selected style
    allowedStyles : [ "static", "dynamic" ], // allowed styles

    canvas    : null, // reference to the canvas this sheet needs to render on

    shapes    : [],  // list of shapes on the sheet
    shapesMap : {},  // name to shape mapping

    selectedShape : null, // the currently selected shape (by clicking on it)
    currentPos    : { x:0, y:0 }, // the position of last mousedown
    selectionPos  : { x:0, y:0 }, // the position of the current selection

    newLeft   : null, // temp var to hold left position of next added shape
    newTop    : null, // temp var to hold top position of next added shape

    eventHandlers : {}, // map of registered eventHandlers

    initialize: function(props) {
	props = props || {};

	this.name  = props.name  || "default";
	this.style = props.style || "static";

	this.canvas    = null;
	this.clear();

	this.eventHandlers = {};
	this.allowedStyles = new Array("static", "dynamic");
    },

    isDynamic: function() {
	return this.style == "dynamic";
    },

    on: function( event, handler ) {
	this.eventHandlers[event] = handler;
    },

    fireEvent: function( event, data ) {
	if( this.eventHandlers[event] ) {
	    this.eventHandlers[event](data);
	}
    },

    setCanvas: function( canvas ) {
	this.canvas = canvas;

	if( this.allowedStyles.indexOf(this.style) < 0 ) {
    	    this.log(this.style + " is an unknown style, reverted to static.\n"+
    		     "Allowed styles are " + this.allowedStyles);
    	    this.style = "static";
	}

	this.canvas.on( "mousedown", this.handleMouseDown.bind(this) );
	this.canvas.on( "mouseup",   this.handleMouseUp  .bind(this) );
	this.canvas.on( "mousedrag", this.handleMouseDrag.bind(this) );
    },

    freeze: function() { if( this.canvas ) { this.canvas.freeze(); } },
    thaw:   function() { if( this.canvas ) { this.canvas.thaw();   } },

    log: function(msg) {
	if( this.canvas ) {
	    this.canvas.log( "Canvas2D.Sheet: " + msg );
	}
    },

    makeDynamic: function() {
	this.style = "dynamic";
    },

    makeStatic: function() {
	this.style = "static";
    },

    at: function(left, top) {
	this.newTop = top;
	this.newLeft = left;
	return this;
    },

    put: function(shape) {
	this.add(shape.setPosition(this.newLeft, this.newTop));
	this.newLeft = null;
	this.newTop = null;
	return shape;
    },

    add: function(shape) {
	this.shapes.push( shape );
	this.shapesMap[shape.getName()] = shape;
	shape.setCanvas(this.canvas);
	this.canvas.render();

	this.log( "Added new shape" + 
		  ( shape.getLeft() != null ? "@" + shape.getLeft() + "," 
		    + shape.getTop() : "" ) );
	return shape;
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
	alert( "Canvas2D.Sheet::getShapesIn: not implemented yet" );
    },

    handleMouseDown: function(pos) {
	if( !this.isDynamic() ) { return; }
	this.selectedShape = this.getShapeAt( pos.x, pos.y );
	if( this.selectedShape ) {
	    this.fireEvent( "shapeSelected", this.selectedShape );
	}
	this.currentPos = pos;
    },

    handleMouseUp: function(pos) {
	if( !this.isDynamic() ) { return; }
	if( this.selectedShape ) {
	    var pos = this.selectedShape.getPosition();
	    this.log( "Shape moved to " + pos.left + ", " + pos.top );
	} else {
	    this.showSelection = false;
	}
    },

    handleMouseDrag: function(pos) {
	if( !this.isDynamic() ) { return; }
	if( this.selectedShape ) {
	    this.selectedShape.move( pos.dx, pos.dy );
	    this.fireEvent( "shapeChanged", this.selectedShape );
	} else {
	    this.showSelection = true;
	    this.selectionPos  = pos;
	}
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
	if( this.selectedShape ) {
	    var box = this.selectedShape.getBox();
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

    clear: function() {
	this.shapes    = [];
    	this.shapesMap = {};
    },

    render: function() {
	var delayed = [];
	this.shapes.each( function(shape) { 
	    if( shape.delayRender() ) {
		delayed.push(shape);
	    } else {
		shape.render(); 
	    }
	} );

	delayed.each( function(shape) { shape.render(); } );

	this.addSelectionOverlay();
	this.addSelectionMarkers();
    },

    toADL: function() {
	var s = "";
	s += "Sheet "  + this.name;
	s += " +" + this.style + " {\n";
	this.shapes.each(function(shape) { 
	    var t = shape.toADL("  ");
	    if( t ) { s += t + "\n"; }
	} );
	s += "}";
	return s;
    }

} );

Canvas2D.Sheet.getNames = function() {
    return [ "sheet" ];
}

Canvas2D.Sheet.from = function(construct, canvas) {
    var style = "static";
    var styleModifier = construct.modifiers.get( "style" );
    if( styleModifier ) {
	style = styleModifier.value.value.toLowerCase();
    }
    
    construct.modifiers.each(function(pair) {
	if( pair.key.toLowerCase() == "static" 
	    || pair.key.toLowerCase() == "dynamic" ) {
	    style = pair.key.toLowerCase();
	}
    });

    var sheet = new Canvas2D.Sheet({ name: construct.name, style: style } );
    canvas.add(sheet);
    return sheet;
};

Canvas2D.ADLVisitor.registerConstruct(Canvas2D.Sheet);
