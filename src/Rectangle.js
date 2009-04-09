Canvas2D.Rectangle = Class.create( Canvas2D.Shape, {
    myProperties: function() {
	return [ "lineColor", "fillColor", "width", "height", "lineWidth" ];
    },

    getType  : function() { return "rectangle"; },

    getLineColor : function() { return this.lineColor  
				|| Canvas2D.Defaults.Rectangle.lineColor ; },
    getFillColor : function() { return this.fillColor  
				|| Canvas2D.Defaults.Rectangle.fillColor ; },
    getLabelPos   : function() { return this.labelPos 
				 || Canvas2D.Defaults.Rectangle.labelPos; },
    getLabelColor : function() { return this.labelColor
				 || Canvas2D.Defaults.Rectangle.labelColor; },
    getWidth : function() { return this.width  
			    || Canvas2D.Defaults.Rectangle.width ; },
    getHeight: function() { return this.height 
			    || Canvas2D.Defaults.Rectangle.height; },

    getLineWidth: function() { return this.lineWidth
			       || Canvas2D.Defaults.Rectangle.lineWidth; },

    getUseCrispLines: function() { return this.useCrispLines != null ? 
				   this.useCrispLines : 
				   Canvas2D.Defaults.Rectangle.useCrispLines; },

    draw: function(sheet, left, top) {
	sheet.save();
	sheet.useCrispLines = this.getUseCrispLines();
	sheet.lineWidth = this.getLineWidth();
	sheet.strokeStyle = this.getLineColor();
	sheet.fillStyle = this.getFillColor();
	sheet.fillRect( left, top, this.getWidth(), this.getHeight() );
	sheet.strokeRect( left, top, this.getWidth(), this.getHeight() );
	sheet.restore();
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
	if( this.getLineColor() ) {
	    construct.modifiers[this.getLineColor()] = null;
	}
	return construct;
    }
} );

Canvas2D.Rectangle.getNames = function() {
    return [ "rectangle", "box" ];
}

Canvas2D.Rectangle.from = function( construct, sheet ) {
    var props = { name: construct.name };
    construct.modifiers.each(function(pair) {
	var key   = pair.key;
	var value = ( pair.value.value ? pair.value.value.value : "" );

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

    var shape = new Canvas2D.Rectangle(props);
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

Canvas2D.ADLVisitor.registerConstruct(Canvas2D.Rectangle);
