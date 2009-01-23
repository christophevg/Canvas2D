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

	switch( construct.type.toLowerCase() ) {
	case "box": // shorter synonym
	case "rectangle":
	    var w = parseInt(construct.modifiers.get( "width"  ).value.value);
	    var h = parseInt(construct.modifiers.get( "height" ).value.value);
	    var c = construct.modifiers.get( "color"  ).value.value;
	    shape = new Canvas2D.Rectangle({ name: construct.name,
					     width: w, height: h, color: c });
	    this.shapes[construct.name] = shape;
	    if( construct.annotation ) {
		var pos = construct.annotation.data.split(",");
		left = parseInt(pos[0]);
		top  = parseInt(pos[1]);
	    } else {
		left = this.offset * ( this.unknownIndex++ );
		top = left;
	    }
	    break;

	case "link": // shorter synonym
	case "connector":
	    var from  = construct.modifiers.get( "from"  ).value.value;
	    var to    = construct.modifiers.get( "to"    ).value.value;
	    var style = construct.modifiers.get( "style" ).value.value;
	    shape = new Canvas2D.Connector( this.shapes[from], this.shapes[to],
					    { style: style } );
	    break;
	case "root":
	    break;
	default:
	    alert( "Canvas2D: Unknown Shape Type: " + construct.type );
	}

	if( shape != parent ) {
	    if( left ) {
		parent.at(left, top).put( shape );
	    } else {
		parent.put( shape );
	    }
	}

	construct.childrenAccept(this, shape);
	return shape;
    }
} );
