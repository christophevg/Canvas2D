Canvas2D.Line = Canvas2D.Shape.extend( {
    getWidth : function() { return this.getDx() },
    getHeight: function() { return this.getDy() },

    draw: function(sheet, left, top) {
	sheet.beginPath();

	sheet.strokeStyle = this.getColor();
	sheet.lineWidth = this.getLineWidth();
	sheet.lineStyle = this.getLineStyle();

	sheet.moveTo(left, top);
	sheet.lineTo(left + this.getDx(), top + this.getDy());
	sheet.stroke();
	// set lineStyle back to default
	sheet.lineStyle = "solid";

	sheet.closePath();
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
	construct.addModifiers( [ "geo", "color" ] );
	return construct;
    }
} );

Canvas2D.Line.from = function( construct, sheet ) {
    var props = { name: construct.name };
    construct.modifiers.iterate(function(key, value) {
	value = ( value.value ? value.value.value : "" );

	if( key == "dx" || key == "dy" || key == "lineWidth" ) {
	    value = parseInt(value);
	} else if( value == "" ) {
	    value = key;
	    key = "color";
	}

	props[key] = value;
    } );

    return new Canvas2D.Line(props);
};

Canvas2D.Line.MANIFEST = {
    name     : "line",
    properties : [ "color", "dx", "dy", "lineWidth", "lineStyle" ],
    libraries: [ "Canvas2D" ]
};

Canvas2D.registerShape( Canvas2D.Line );
