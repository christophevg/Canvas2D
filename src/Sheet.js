Canvas2D.Sheet = Class.create( {
    initialize: function initialize(props) {
	props = props || {};

	this.name  = props.name  || "default";   // name of the sheet
	this.style = props.style || "static";    // selected style

	this.clear();
	this.dirty = false;

	if(props.canvas) { this.setCanvas(props.canvas); }
    },

    setCanvas: function setCanvas(canvas) {
	this.canvas = canvas;
	this.wireCanvasDelegation();
	this.setupProperties();
    },

    wireCanvasDelegation: function wireCanvasDelegation() {
	if( !this.canvas ) { return; }

	Canvas2D.Sheet.Operations.each(function(operation) {
	    this[operation] = function() {
		this.transferProperties();
		return this.canvas[operation].apply(this.canvas, arguments);
	    }.bind(this);
	}.bind(this) );
    },

    setupProperties: function setupProperties() {
	Canvas2D.Sheet.Properties.each( function(prop) {
	    this[prop] = Canvas2D.Sheet.Defaults[prop] || this.canvas[prop];
	}.bind(this) );
    },
    
    transferProperties : function() {
	Canvas2D.Sheet.Properties.each(function(prop) {
	    this.canvas[prop] = this[prop];
	}.bind(this) );
    },

    makeDirty: function() {
	this.dirty = true;
	this.fireEvent( "change" );
    },

    isDirty: function() {
	return this.dirty;
    },

    clear: function() {
	this.positions      = []; // list of shapes on the sheet
    	this.shapesMap      = {}; // name to shape mapping
    	this.positionsMap   = {}; // shape to position mapping
	this.selectedShapes = []; // list of selected shapes

	this.fireEvent( "change" );
    },

    makeDynamic: function() { this.style = "dynamic";         },
    makeStatic : function() { this.style = "static";          },
    isDynamic  : function() { return this.style == "dynamic"; },
    isStatic   : function() { return !this.isDynamic();       },

    freeze: function() { this.fireEvent( "freeze" ); },
    thaw:   function() { this.fireEvent( "thaw" );   },

    at: function(left, top) {
	this.newTop  = top;
	this.newLeft = left;
	return this;
    },

    put: function(shape) {
	return this.add(shape);
    },

    add: function(shape) {
	var position = new Canvas2D.Position( shape, this.newLeft, this.newTop);
	shape   .on( "change", this.makeDirty.bind(this) );
	position.on( "change", this.makeDirty.bind(this) );

	this.newLeft = null;
	this.newTop = null;

	this.positions.push(position);
	this.shapesMap[shape.getName()] = shape;
	this.positionsMap[shape.getName()] = position;

	this.fireEvent( "newShape",
			"added new shape" + 
			( position.getLeft() != null ? 
			  "@" + position.getLeft() + "," 
			  + position.getTop() : "" ) );
	return shape;
    },

    getPosition: function getPosition(shape) {
	return this.positionsMap[shape.getName()];
    },

    hit: function(x,y) {
	for( var s = this.positions.length-1; s>=0; s-- ) {
	    var position = this.positions[s];
	    if( position.hit(x,y) ) {
		if( Canvas2D.Keyboard.keyDown(91) ||    // cmd
		    Canvas2D.Keyboard.keyDown(17) )     // ctrl
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
	    ( Canvas2D.Keyboard.keyDown(91) || // cmd
	      Canvas2D.Keyboard.keyDown(17) ) // ctrl
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
	this.makeDirty();
    },

    handleMouseUp: function(pos) {
	if( !this.isDynamic() ) { return; }
	this.selectedShapes.each(function(position) {
	    this.fireEvent( "shapesMoved",
			    "Shape moved to " + 
			    position.left + ", " + position.top );
	}.bind(this) );
	this.showSelection   = false;
	this.makeDirty();
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
	this.makeDirty();
    },

    selectAllShapes: function() {
	// FIXME: only selectable shapes (so no connectors)
	this.selectedShapes = this.positions.clone();
	this.makeDirty();
    },

    moveCurrentSelection: function(dx, dy) {
	this.selectedShapes.each(function(position) {	
	    position.move(dx, dy);
	}.bind(this) );
    },

    handleKeyDown: function(key) {
	if( Canvas2D.Keyboard.keyDown(16) ) { // shift + 
	    switch(key) {
	    case 37: this.moveCurrentSelection( -5,  0 ); break; // left
	    case 38: this.moveCurrentSelection(  0, -5 ); break; // up
	    case 39: this.moveCurrentSelection(  5,  0 ); break; // right
	    case 40: this.moveCurrentSelection(  0,  5 ); break; // down
	    }
	}
	if( ( Canvas2D.Keyboard.keyDown(91) ||    // cmd 
	      Canvas2D.Keyboard.keyDown(17) ) &&  // ctrl +
	    key == 65 &&                                   // a
	    this.canvas.mouseOver )
	{
	    this.selectAllShapes();
	}
    },

    addSelectionOverlay: function() {
	if( this.showSelection ) { 
	    var pos = this.selectionPos;
	    var dx = pos.x - this.currentPos.x;
	    var dy = pos.y - this.currentPos.y;
	    
	    this.canvas.fillStyle = "rgba( 0, 0, 255, 0.1 )";
	    this.canvas.fillRect( pos.x <= this.currentPos.x ? 
				  pos.x : this.currentPos.x, 
				  pos.y <= this.currentPos.y ?
				  pos.y : this.currentPos.y,
				  Math.abs(dx), Math.abs(dy) );
	}
    },

    addSelectionMarkers: function() {
	this.selectedShapes.each( function(shape) {
	    var box = shape.getBox();
	    this.canvas.fillStyle = "rgba( 200, 200, 255, 1 )";
	    [[ box.left, box.top    ], [ box.right, box.top    ],
	     [ box.left, box.bottom ], [ box.right, box.bottom ]].each( 
		 function(corner) {
		     this.canvas.beginPath();
		     this.canvas.arc( corner[0],  corner[1], 5, 0, 
				      Math.PI*2, true );
		     this.canvas.fill();	
		 }.bind(this) );
	}.bind(this) );
    },

    render: function() {
	var delayed = [];
	this.positions.each( function(shape) { 
	    if( shape.delayRender() ) {
		delayed.push(shape);
	    } else {
		shape.render(this); 
	    }
	}.bind(this) );

	delayed.each( function(shape) { 
	    shape.render(this); 
	}.bind(this) );

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
    }
} );

// add-in some common functionality
Canvas2D.Sheet = Class.create( Canvas2D.Sheet, 
			       Canvas2D.Factory.extensions.all.EventHandling );

Canvas2D.Sheet.Properties = 
    [ "globalAlpha", "globalCompositeOperation",
      "strokeStyle", "fillStyle", "lineWidth", 
      "lineCap", "lineJoin", "miterLimit", 
      "shadowOffsetX", "shadowOffsetY", "shadowBlur", "shadowColor", 
      "font", "textAlign", "textBaseline",

      "useCrispLines", "textDecoration" ];

Canvas2D.Sheet.Operations = 
    [ "save", "restore", 
      "scale", "rotate", "translate", "transform", "setTransform",
      "createRadialGradient", "createPattern",
      "clearRect", "fillRect", "strokeRect",
      "beginPath", "closePath", "moveTo", "lineTo",
      "quadraticCurveTo", "bezierCurveTo", 
      "arcTo", "rect", "arc",
      "fill", "stroke", 
      "clip","isPointInPath", 
      "fillText","fillText","strokeText","strokeText","measureText",
      "drawImage","createImageData","getImageData","putImageData",

      "getFontSize" ];

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

Canvas2D.Sheet.MANIFEST = {
    name      : "sheet",
    properties : [],
    libraries : [ "Canvas2D" ]
};

Canvas2D.registerShape( Canvas2D.Sheet );
