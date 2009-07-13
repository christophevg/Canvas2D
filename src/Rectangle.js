Canvas2D.Rectangle = Canvas2D.CompositeShape.extend( {
    draw: function(sheet, left, top) {
	sheet.useCrispLines = this.getUseCrispLines();
	sheet.lineWidth     = this.getLineWidth();
	sheet.strokeStyle   = this.getLineColor();
	sheet.fillStyle     = this.getFillColor();

	var width = this.getWidth();
	var height = this.getHeight();
	if( this.grow ) { 
	    width  = this.getParent().getChildWidth()  || width; 
	    height = this.getParent().getChildHeight() || height; 
	}
	sheet.fillRect( left, top, width, height );
	sheet.strokeRect( left, top, width, height );
	this._super(sheet, left, top);
    },

    hit: function(x,y) { 
	return ( this.getWidth() >= x && this.getHeight() >= y ); 
    },

    hitArea: function(left, top, right, bottom) { 
	return ! ( 0 > right 
		   || this.getWidth() < left
		   || 0 > bottom
		   || this.getHeight() < top );
    },

    getCenter: function() {
	return { left: this.getWidth()  / 2, top:  this.getHeight() / 2 };
    },

    getPort: function(side) {
	switch(side) {
	case "n": case "north":  
	    return { top : 0,                left: this.getWidth() / 2 }; break;
	case "s": case "south":  
	    return { top : this.getHeight(), left: this.getWidth() / 2 }; break;
	case "e": case "east":
	    return { top : this.getHeight() / 2, left: this.getWidth() }; break;
	case "w": case "west":
	    return { top : this.getHeight() / 2, left: 0               }; break;
	}
    },

    getGeo: function() {
	return this.getWidth() && this.getHeight() ?
	    this.getWidth() + "x" + this.getHeight() : null;
    },

    asConstruct: function() {
	var construct = this._super();
	construct.addModifiers( [ "geo", "lineColor" ] );
	return construct;
    }
} );

Canvas2D.Rectangle.from = function( construct, sheet ) {
    var props = { name: construct.name };
    construct.modifiers.iterate(function(key, value) {
	value = ( value.value ? value.value.value : "" );

	if( key == "width" || key == "height" ) {
	    value = parseInt(value);
	}

	if( key == "geo" ) {
	    props["width"]   = parseInt(value.split("x")[0]);
	    props["height"]  = parseInt(value.split("x")[1]);
	}

	if( "" + value == "" ) {
	    value = key;
	    key = "lineColor";
	}

	props[key] = value;
    } );

    return new Canvas2D.Rectangle(props);
};

Canvas2D.Rectangle.MANIFEST = {
    name         : "rectangle",
    aliasses     : [ "box" ],
    properties   : [ "lineWidth", "lineColor", 
		     "fillColor", 
		     "width", "height", "grow" ],
    propertyPath : [ Canvas2D.CompositeShape ],
    libraries    : [ "Canvas2D" ]
};

Canvas2D.registerShape( Canvas2D.Rectangle );
