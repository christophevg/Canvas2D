Canvas2D.Alias = {};

Canvas2D.Alias.getNames = function() {
    return [ "alias", "shape" ];
}

Canvas2D.Alias.mapper = {
    sheet : function(shape) { 
	return function(construct, parent) { 
	    var alias = Canvas2D.Sheet.from(construct,parent);
	    alias.toADL = function() {
		var s = "";
		s += shape.name + " "  + this.name;
		s += " +" + this.style + " {\n";
		this.shapes.each(function(shape) { 
		    var t = shape.toADL("  ");
		    if( t ) { s += t + "\n"; }
		} );
		s += "}";
		return s;
	    }
	    return alias;
	}
    },

    connector : function(shape) {
	return function(construct, parent) { 
	    var modifier = new ADL.Modifier( "style", 
		new ADL.String("vertical" ) );
	    construct.modifiers.set( modifier.key, modifier );
	    var alias = Canvas2D.Connector.from(construct,parent);
	    alias.toADL = function(prefix) {
		var s = this.positionToString(prefix);
		s += prefix + shape.name + " " + this.props.name;
		s += "+" + this.from.props.name + "-" + this.to.props.name +";";
		return s;
	    }
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
	    alias.toADL = function(prefix) {
		var s = this.positionToString(prefix);
		s += prefix + shape.name + " "  + this.props.name + ";";
		return s;
	    }
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
