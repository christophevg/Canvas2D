Canvas2D.ADLVisitor = Class.create( {
    visit: function( construct, parent ) {
	var parentConstruct = parent;
	var left, top;

	var constructType = construct.type.toLowerCase();
	if( constructType == "root" ) {
	    // just move on to the children
	    construct.childrenAccept(this, parent);
	    return parent;
	} else if( Canvas2D.ADLVisitor.knownConstructs[constructType] ) {
	    var elem = Canvas2D.ADLVisitor.knownConstructs[constructType]
	                     .from(construct, parent);
	    construct.childrenAccept(this, elem);
	    return construct;
	} else {
	    alert( "Canvas2D.ADLVisitor: Unknown Construct Type: " 
		   + construct.type );
	    // if we don't know the construct type, no need to go further
	    return parent;
	}
    }
} );

Canvas2D.ADLVisitor.knownConstructs = {};

Canvas2D.ADLVisitor.registerConstruct = function(construct) {
    construct.getNames().each(function(name) {
	Canvas2D.ADLVisitor.knownConstructs[name] = construct;
    } );
};
