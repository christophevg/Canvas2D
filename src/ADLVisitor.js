Canvas2D.ADLVisitor = Class.extend( {
    visit: function( construct, parent ) {
	var constructType = construct.type.toLowerCase();
	if( constructType == "root" ) {
	    // just move on to the children
	    construct.childrenAccept(this, parent);
	    return parent;
	} else if( Canvas2D.shapes.get(constructType) ) {
	    var elem = Canvas2D.shapes.get(constructType)
	                              .from(construct, parent);
	    construct.childrenAccept(this, elem);
	    return construct;
	} else {
	    console.log( "Canvas2D.ADLVisitor: Unknown Construct Type: " 
			 + construct.type );
	    // if we don't know the construct type, no need to go further
	    return parent;
	}
    }
} );
