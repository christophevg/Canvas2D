Canvas2D.Arrow = Canvas2D.Rectangle.extend( {
    draw: function(sheet, left, top) {
	// rect
	sheet.useCrispLines = this.getUseCrispLines();
	sheet.lineWidth     = this.getLineWidth();
	sheet.strokeStyle   = this.getLineColor();
	sheet.fillStyle     = this.getFillColor();

	sheet.fillRect( left, 
		top, 
		this.getWidth() - this.getArrowHeadWidth(), 
		this.getHeight() );
	sheet.strokeRect( left, 
		top, 
		this.getWidth() - this.getArrowHeadWidth(), 
		this.getHeight() );

	// arrow head
	sheet.beginPath();

	sheet.moveTo(left + this.getWidth() - this.getArrowHeadWidth(), top);
	
	sheet.lineTo(left + this.getWidth() - this.getArrowHeadWidth(), 
		top + (this.getHeight() / 2) - (this.getArrowHeadHeight() / 2));
	sheet.lineTo(left + this.getWidth(), 
		top + (this.getHeight() / 2));
	sheet.lineTo(left + this.getWidth() - this.getArrowHeadWidth(), 
		top + (this.getHeight() / 2) + (this.getArrowHeadHeight() / 2));
	
	sheet.closePath();

	sheet.stroke();
	sheet.fill();
    },

    hit: function(x,y) {
	// FIXME
	return ( this.getWidth() >= x && this.getHeight() >= y ); 
    },

    hitArea: function(left, top, right, bottom) {
	// FIXME
	return ! ( 0 > right 
		   || this.getWidth() < left
		   || 0 > bottom
		   || this.getHeight() < top );
    },

    getCenter: function() {
	// FIXME
	return { left: this.getWidth()  / 2, top:  this.getHeight() / 2 };
    },

    getPort: function(side) {
	// FIXME
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
    }
} );

Canvas2D.Arrow.from = function( construct, sheet ) {
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

    return new Canvas2D.Arrow(props);
};

Canvas2D.Arrow.MANIFEST = {
    name         : "arrow",
    aliasses     : [ "pointer" ],
    properties   : [ "width", "height", "arrowHeadWidth", "arrowHeadHeight" ],
    propertyPath : [ Canvas2D.Rectangle ],
    libraries    : [ "Canvas2D" ]
};

Canvas2D.registerShape( Canvas2D.Arrow );
