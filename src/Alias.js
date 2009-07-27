Canvas2D.Alias = Canvas2D.Shape.extend( {} );

Canvas2D.Alias.mapper = {
    sheet : function(shape) { 
	return function(construct, parent) { 
	    var alias = Canvas2D.Sheet.from(construct, parent);
	    //alias.getType = function() { return shape.name; }
	    return alias;
	}
    },

    connector : function(shape) {
	return function(construct, parent) { 
	    var modifier = new ADL.Modifier( "routing", 
		                             new ADL.String("vertical" ) );
	    construct.modifiers.set( modifier.key, modifier );
	    var alias = Canvas2D.Connector.from(construct, parent);
	    //alias.getType = function() { return shape.name; }
	    return alias;
	}
    },

    image : function(shape) {
	var modifiers = shape.modifiers;
	return function( construct, parent ) {
	    modifiers.iterate(function(key, value) {
		construct.modifiers.set(key, value); 
	    } );
	    var alias = Canvas2D.Image.from(construct, parent);
	    //alias.getType = function() { return shape.name; }
	    return alias;
	}
    }
}

Canvas2D.Alias.from = function( construct, parent ) {
    Canvas2D.registerShape( { 
	prototype : {},
	MANIFEST : { 
	    name      : construct.name, 
	    libraries : [ "Aliasses" ] 
	},
	from: Canvas2D.Alias.mapper[construct.supers[0]](construct, parent)
    } );
};
    
Canvas2D.Alias.MANIFEST = {
    name     : "alias",
    aliasses : [ "shape" ],
    libraries: [] // not included in the end-user library, because it's not 
                  // a visible shape
};

Canvas2D.registerShape( Canvas2D.Alias );
