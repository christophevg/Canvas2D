Canvas2D.Sheet = Class.create( {
    initialize: function(props) {
	props = props || {};

	this.name  = props.name  || "default";   // name of the sheet
	this.style = props.style || "static";    // selected style

	this.allowedStyles = [ "static", "dynamic" ]; // allowed styles

	this.setBook(props.book);  // reference to the book
	this.clear();

	this.selectedShapes = [];  // list of selected shapes

	this.dirty = false;

	// dynamically add passthrough functions
	passThroughFunctions = 
	    [ "scale", "translate", "transform", "setTransform",
	      "createLinearGradient",  "createRadialGradient", "createPattern",
	      "save", "restore",
	      "clearRect", "fillRect", "strokeRect", "fillStrokeRect",
	      "arc", "rotate", "drawImage",
	      "fillText", "strokeText", "measureText",
	      "fillTextCenter", "strokeTextCenter",
	      "fillTextRight", "strokeTextRight",
	      "lineTo", "moveTo",
	      "fill", "stroke",
	      "closePath", "beginPath",
	      "clip", "isPointInPath",
	      "createImageData", "getImageData", "putImageData" ];
	var me = this;
	passThroughFunctions.each(function(fnc) {
	    if( !me[fnc] ) {
		me[fnc] = function() {
		    this.transferProperties();
		    this.canvas[fnc].apply(this.canvas, arguments);
		};
	    }
	});
    },

    makeDirty: function() {
	this.dirty = true;
    },

    isDirty: function() {
	return this.dirty;
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

    setBook: function( book ) {
	if( !book ) { return; }
	this.book = book;
	this.canvas = this.book.canvas;

	// TODO: move to initilialize when style is set
	if( this.allowedStyles.indexOf(this.style) < 0 ) {
    	    this.log(this.style + " is an unknown style, reverted to static.\n"+
    		     "Allowed styles are " + this.allowedStyles);
    	    this.style = "static";
	}

	this.book.on( "mousedown", this.handleMouseDown.bind(this) );
	this.book.on( "mouseup",   this.handleMouseUp  .bind(this) );
	this.book.on( "mousedrag", this.handleMouseDrag.bind(this) );

	this.book.on( "keydown",   this.handleKeyDown  .bind(this) );
    },

    freeze: function() { if( this.book ) { this.book.freeze(); } },
    thaw:   function() { if( this.book ) { this.book.thaw();   } },

    log: function(msg) { 
	if( this.book ) { this.book.log( "Canvas2D.Sheet: " + msg ); }
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
	shape.on( "changed", this.makeDirty.bind(this) );
	var position = new Canvas2D.Position( shape, this.newLeft, this.newTop);
	this.newLeft = null;
	this.newTop = null;

	this.positions.push(position);
	this.shapesMap[shape.getName()] = shape;
	this.positionsMap[shape.getName()] = position;

	this.log( "Added new shape" + 
		  ( position.getLeft() != null ? "@" + position.getLeft() + "," 
		    + position.getTop() : "" ) );
	this.book.rePublish();

	return shape;
    },

    hit: function(x,y) {
	for( var s = this.positions.length-1; s>=0; s-- ) {
	    var position = this.positions[s];
	    if( position.hit(x,y) ) {
		if( this.book.currentKeysDown.contains(91) ||    // cmd
		    this.book.currentKeysDown.contains(17) )     // ctrl
		{
		    // adding and removing
		    if( this.selectedShapes.contains(position) ) {
			this.selectedShapes = 
			    this.selectedShapes.without(position);
		    } else {
			this.selectedShapes.push(position);
		    }
		} else {
		    if( !this.selectedShapes.contains(position) ) {
			this.selectedShapes = [ position ];
		    } else {
			// just clicked on already selected shape
			return;
		    }
		}
		this.fireEvent( "shapeSelected", position );
		return;
	    }
	}
	// no position was hit, so clearing the selection list
	this.selectedShapes = [];
    },

    hitArea: function( left, top, right, bottom ) {
	var newSelection =  
	    ( this.book.currentKeysDown.contains(91) || // cmd
	      this.book.currentKeysDown.contains(17) ) // ctrl
	    ? this.selectedShapes : [];
	for( var s = this.positions.length-1; s>=0; s-- ) {
	    if( this.positions[s].hitArea(left, top, right, bottom) ) {
		newSelection.push( this.positions[s] );
		this.fireEvent( "shapeSelected", this.positions[s] );
	    }
	}
	this.selectedShapes = newSelection.uniq();
    },

    handleMouseDown: function(pos) {
	if( !this.isDynamic() ) { return; }
	this.hit( pos.x, pos.y );
	this.currentPos = pos;
	this.book.rePublish();
    },

    handleMouseUp: function(pos) {
	if( !this.isDynamic() ) { return; }
	var me = this;
	this.selectedShapes.each(function(position) {
	    me.log( "Shape moved to " + position.left + ", " + position.top );
	} );
	this.showSelection   = false;
	this.book.rePublish();
    },

    handleMouseDrag: function(pos) {
	if( !this.isDynamic() ) { return; }
	if( !this.showSelection && this.selectedShapes.length > 0 ) {
	    this.moveCurrentSelection(pos.dx, pos.dy);
	} else {
	    this.showSelection = true;
	    this.hitArea( this.currentPos.x, this.currentPos.y,
			  pos.x,             pos.y );
	    this.selectionPos  = pos;
	}
	this.book.rePublish();
    },

    selectAllShapes: function() {
	// FIXME: only selectable shapes (so no connectors)
	this.selectedShapes = this.positions.clone();
	this.book.rePublish();
    },

    moveCurrentSelection: function(dx, dy) {
	var me = this;
	this.selectedShapes.each(function(position) {	
	    position.move(dx, dy);
	    me.fireEvent( "shapeChanged", position );
	} );
	this.book.rePublish();
    },

    handleKeyDown: function(key) {
	if( this.book.currentKeysDown.contains(16) ) { // shift + 
	    switch(key) {
	    case 37: this.moveCurrentSelection( -5,  0 ); break; // left
	    case 38: this.moveCurrentSelection(  0, -5 ); break; // up
	    case 39: this.moveCurrentSelection(  5,  0 ); break; // right
	    case 40: this.moveCurrentSelection(  0,  5 ); break; // down
	    }
	}
	if( ( this.book.currentKeysDown.contains(91) ||    // cmd 
	      this.book.currentKeysDown.contains(17) ) &&  // ctrl +
	    key == 65 &&                                   // a
	    this.book.canvas.mouseOver )
	{
	    this.selectAllShapes();
	}
    },

    addSelectionOverlay: function() {
	if( this.showSelection ) { 
	    var pos = this.selectionPos;
	    var dx = pos.x - this.currentPos.x;
	    var dy = pos.y - this.currentPos.y;
	    
	    this.fillStyle = "rgba( 0, 0, 255, 0.1 )";
	    this.fillRect( pos.x <= this.currentPos.x ? 
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

    transferProperties : function() {
	var canvas = this.canvas;
	var currentValues = this;
	$H(Canvas2D.Defaults.Sheet).each(function(prop) {
	    canvas[prop.key] = currentValues[prop.key] || prop.value;
	} );
    },

    getFontSize: function() {
	return getFontSize( this.font || Canvas2D.Defaults.Sheet.font );
    }

} );

// add-in some common functionality
Canvas2D.Sheet = Class.create( Canvas2D.Sheet, 
			       Canvas2D.Factory.extensions.EventHandling );

Canvas2D.Sheet.getNames = function() {
    return [ "sheet" ];
}

Canvas2D.Sheet.from = function(construct, book) {
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
    book.addSheet(sheet);
    return sheet;
};

Canvas2D.ADLVisitor.registerConstruct(Canvas2D.Sheet);
