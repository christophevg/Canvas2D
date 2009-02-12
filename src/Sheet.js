Canvas2D.Sheet = Class.create( {
    initialize: function(props) {
	props = props || {};

	this.name  = props.name  || "default";   // name of the sheet
	this.style = props.style || "static";    // selected style

	this.allowedStyles = [ "static", "dynamic" ]; // allowed styles

	this.canvas  = props.canvas || null;   // reference to the canvas
	this.clear();

	this.eventHandlers = {};   // map of registered eventHandlers
	this.selectedShapes = [];  // list of selected shapes
    },

    clear: function() {
	this.positions    = []; // list of shapes on the sheet
    	this.shapesMap    = {}; // name to shape mapping
    	this.positionsMap = {}; // shape to position mapping
    },

    makeDynamic: function() { this.style = "dynamic";         },
    makeStatic : function() { this.style = "static";          },
    isDynamic  : function() { return this.style == "dynamic"; },
    isStatic   : function() { return !this.isDynamic();       },

    // TODO: move to eventSource mixin
    on: function( event, handler ) {
	this.eventHandlers[event] = handler;
    },
    // TODO: move to eventSource mixin
    fireEvent: function( event, data ) {
	if( this.eventHandlers[event] ) {
	    this.eventHandlers[event](data);
	}
    },

    setCanvas: function( canvas ) {
	this.canvas = canvas;

	// TODO: move to initilialize when style is set
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

    at: function(left, top) {
	this.newTop = top;
	this.newLeft = left;
	return this;
    },

    put: function(shape) {
	return this.add(shape);
    },

    add: function(shape) {
	var position = new Canvas2D.Position( shape, this.newLeft, this.newTop);
	this.newLeft = null;
	this.newTop = null;

	this.positions.push(position);
	this.shapesMap[shape.getName()] = shape;
	this.positionsMap[shape.getName()] = position;

	this.log( "Added new shape" + 
		  ( position.getLeft() != null ? "@" + position.getLeft() + "," 
		    + position.getTop() : "" ) );

	this.canvas.render();
	return shape;
    },

    hit: function(x,y) {
	this.selectedShapes = [];
	for( var s = this.positions.length-1; s>=0; s-- ) {
	    if( this.positions[s].hit(x,y) ) {
		this.selectedShapes.push( this.positions[s] );
		this.fireEvent( "shapeSelected", this.positions[0] );
		return;
	    }
	}
    },

    handleMouseDown: function(pos) {
	if( !this.isDynamic() ) { return; }
	this.hit( pos.x, pos.y );
	this.currentPos = pos;
    },

    handleMouseUp: function(pos) {
	if( !this.isDynamic() ) { return; }
	var me = this;
	this.selectedShapes.each(function(position) {
	    me.log( "Shape moved to " + position.left + ", " + position.top );
	} );
	this.showSelection   = false;
    },

    handleMouseDrag: function(pos) {
	if( !this.isDynamic() ) { return; }
	if( this.selectedShapes.length > 0 ) {
	    var me = this;
	    this.selectedShapes.each(function(position) {	
		position.move( pos.dx, pos.dy );
		me.fireEvent( "shapeChanged", position );
	    } );
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
	var me = this;
	this.selectedShapes.each( function(shape) {
	    var box = shape.getBox();
	    me.canvas.fillStyle = "rgba( 200, 200, 255, 1 )";
	    var canvas = me.canvas;
	    [[ box.left, box.top    ], [ box.right, box.top    ],
	     [ box.left, box.bottom ], [ box.right, box.bottom ]].each( 
		 function(corner) {
		     canvas.beginPath();
		     canvas.arc( corner[0],  corner[1], 5, 0, Math.PI*2, true );
		     canvas.fill();	
		 } );
	} );
    },

    render: function() {
	var delayed = [];
	var sheet = this;
	this.positions.each( function(shape) { 
	    if( shape.delayRender() ) {
		delayed.push(shape);
	    } else {
		shape.render(sheet); 
	    }
	} );

	delayed.each( function(shape) { shape.render(sheet); } );

	this.addSelectionOverlay();
	this.addSelectionMarkers();
    },

    toADL: function() {
	var s = "";
	s += "Sheet "  + this.name;
	s += " +" + this.style + " {\n";
	this.positions.each(function(shape) { 
	    var t = shape.toADL("  ");
	    if( t ) { s += t + "\n"; }
	} );
	s += "}";
	return s;
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
    },

    lineTo: function(x,y) {
	this.canvas.lineStyle = this.lineStyle;
	this.canvas.lineTo(x,y);
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

    drawImage: function(img, left, top) {
	this.canvas.drawImage(img, left, top);
    },

    rotate: function(ang) {
	this.canvas.rotate(ang);
    },

    arc: function(left, top, radius, startAngle, endAngle, anticlockwise ) {
	this.canvas.arc(left, top, radius, 
			startAngle, endAngle, anticlockwise );
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
