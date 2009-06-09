Canvas2D.LinePath = Class.create( Canvas2D.Shape, {
    getWidth : function() { return this.dx },
    getHeight: function() { return this.dy },

    getStart : function() { return this.start; },
    getMoves : function() { return this.moves; },

    preprocess : function(props) {
	if( props.start ) {
	    var parts = props.start.split(",");
	    props.start = { left:parseInt(parts[0]), top:parseInt(parts[1]) };
	} else {
	    props.start = { left:0, top:0 };
	}
	if( props.moves ) {
	    var moves = [];
	    var dx = max(0,props.start.left);
	    var dy = max(0,props.start.top );

	    props.moves.split(";").each( function(move) {
		var parts = move.split(",");
		moves.push( {dx:parseInt(parts[0]), dy:parseInt(parts[1])} );
		dx = max(dx, dx + parseInt(parts[0]));
		dy = max(dy, dy + parseInt(parts[1]));
	    });
	    props.moves = moves;
	    props.dx    = dx;
	    props.dy    = dy;
	}
	return props;
    },

    draw: function(sheet, left, top) {
	sheet.beginPath();
	sheet.strokeStyle = this.getColor();
	sheet.lineWidth = this.getLineWidth();
	sheet.lineStyle = this.getLineStyle();

	left += this.start.left;
	top  += this.start.top;
	sheet.moveTo(left, top);
	this.getMoves().each( function(move) {
	    left = left + move.dx;
	    top  = top  + move.dy;
	    sheet.lineTo(left, top);
	} );
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

Canvas2D.LinePath.from = function( construct, sheet ) {
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

    var shape = new Canvas2D.LinePath(props);
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

Canvas2D.LinePath.MANIFEST = {
    name       : "linepath",
    properties : [ "dx", "dy", "start", "moves", "color", "lineWidth", "lineStyle" ],
    libraries  : [ "Canvas2D" ]
};

Canvas2D.registerShape( Canvas2D.LinePath );