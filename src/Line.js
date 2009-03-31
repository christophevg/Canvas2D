Canvas2D.Line = Class.create( Canvas2D.Shape, {
    myProperties: function() {
	return [ "color", "dx", "dy", "lineWidth", "lineStyle" ];
    },

    getType  : function() { return "rectangle"; },

    getColor    : function() { return this.color || Canvas2D.Defaults.Line.color; },
    getDX       : function() { return this.dx != null ?
			       this.dx : Canvas2D.Defaults.Line.dx },
    getDY       : function() { return this.dy != null ? 
			       this.dy : Canvas2D.Defaults.Line.dy  },
    getLineWidth: function() { return this.lineWidth 
			       || Canvas2D.Defaults.Line.lineWidth; },
    getLineStyle: function() { return this.lineStyle 
			       || Canvas2D.Defaults.Line.lineWidth; },
    getLabelPos   : function() { return this.labelPos 
				 || Canvas2D.Defaults.Line.labelPos; },
    getLabelColor : function() { return this.labelColor
				 || Canvas2D.Defaults.Line.labelColor; },

    getWidth : function() { return this.getDX() },
    getHeight: function() { return this.getDY() },

    draw: function(sheet, left, top) {
	sheet.beginPath();

	sheet.strokeStyle = this.getColor();
	sheet.lineWidth = this.getLineWidth();
	sheet.lineStyle = this.getLineStyle();

	sheet.moveTo(left, top);
	sheet.lineTo(left + this.getDX(), top + this.getDY());
	sheet.stroke();

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

    asConstruct: function($super) {
	var construct = $super();
	if( this.getWidth() && this.getHeight() ) {
	    construct.modifiers.geo = 
		"\"" + this.getWidth() + "x" + this.getHeight() + "\"";
	}
	if( this.getColor() ) {
	    construct.modifiers[this.getColor()] = null;
	}
	return construct;
    }
} );

Canvas2D.Line.getNames = function() {
    return [ "line" ];
}

Canvas2D.Line.from = function( construct, sheet ) {
    var props = { name: construct.name };
    construct.modifiers.each(function(pair) {
	var key   = pair.key;
	var value = ( pair.value.value ? pair.value.value.value : "" );

	if( key == "dx" || key == "dy" || key == "lineWidth" ) {
	    value = parseInt(value);
	} else if( value == "" ) {
	    value = key;
	    key = "color";
	}

	props[key] = value;
    } );

    var shape = new Canvas2D.Line(props);
    var left, top;
    if( construct.annotation ) {    
	var pos = construct.annotation.data.split(",");
	left = parseInt(pos[0]);
	top  = parseInt(pos[1]);
    } else {
	left = this.offset * ( this.unknownIndex++ );
	top = left;
    }
    sheet.at(left,top).put( shape );
    return shape;
};

Canvas2D.ADLVisitor.registerConstruct(Canvas2D.Line);
