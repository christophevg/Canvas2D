Canvas2D.ADLVisitor = Class.create( {
    offset: 25,
    unknownIndex: 1,
    shapes: {},

    initialize: function() {
	this.offset = 25;
	this.unknownIndex = 1;
	this.shapes = {};
    },

    visit: function( construct, parent ) {
	var shape = parent;
	var left, top;

	var shapeType = construct.type.toLowerCase();
	if( shapeType == "root" ) {
	    // nothing to do
	} else if( Canvas2D.ADLVisitor.knownShapes[shapeType.toLowerCase()] ) {
	    shape = Canvas2D.ADLVisitor.knownShapes[shapeType.toLowerCase()]
	               .from(construct, parent);
	} else {
	    alert( "Canvas2D: Unknown Shape Type: " + construct.type );	    
	}

	if( shape != parent ) {
	    if( shape.pos != null ) {
		parent.at(shape.pos.left, shape.pos.top).put( shape.shape );
	    } else {
		parent.put( shape.shape );
	    }
	    construct.childrenAccept(this, shape.shape);
	    return shape.shape;
	} else {
	    construct.childrenAccept(this, parent);
	    return parent;
	}

    }
} );

Canvas2D.ADLVisitor.knownShapes = {};

Canvas2D.ADLVisitor.registerShape = function(shape) {
    shape.getNames().each(function(name) {
	Canvas2D.ADLVisitor.knownShapes[name] = shape;
    } );
};
