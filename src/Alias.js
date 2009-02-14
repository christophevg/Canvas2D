Canvas2D.Alias = {};

Canvas2D.Alias.getNames = function() {
    return [ "alias", "shape" ];
}

Canvas2D.Alias.mapper = {
    sheet : function(shape) { 
	return function(construct, parent) { 
	    var alias = Canvas2D.Sheet.from(construct,parent);
	    alias.getType = function() { return shape.name; }
	    return alias;
	}
    },

    connector : function(shape) {
	return function(construct, parent) { 
	    var modifier = new ADL.Modifier( "routing", 
		new ADL.String("vertical" ) );
	    construct.modifiers.set( modifier.key, modifier );
	    var alias = Canvas2D.Connector.from(construct,parent);
	    alias.getType = function() { return shape.name; }
	    return alias;
	}
    },

    image : function(shape) {
	var modifiers = shape.modifiers;
	return function( construct, parent ) {
	    modifiers.each(function(pair) {
		construct.modifiers.set(pair.key, pair.value); 
	    } );
	    var alias = Canvas2D.Image.from(construct,parent);
	    alias.getType = function() { return shape.name; }
	    return alias;
	}
    }
}

Canvas2D.Alias.from = function( construct, parent ) {
    Canvas2D.ADLVisitor.registerConstruct( 
	{ getNames : function() { return [ construct.name ] },
	  from     : Canvas2D.Alias.mapper[construct.zuper](construct) } );
}

Canvas2D.ADLVisitor.registerConstruct(Canvas2D.Alias);
