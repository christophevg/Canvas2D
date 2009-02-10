Canvas2D.Rectangle = Class.create( Canvas2D.Shape, {
    allProperties: function($super) {
	var props = $super();
	props.push( "color"  );
	props.push( "width"  );
	props.push( "height" );
	return props;
    },

    getType  : function() { return "rectangle"; },

    getColor : function() { return this.color;  },
    getWidth : function() { return this.width;  },
    getHeight: function() { return this.height; },

    draw: function() {
	this.canvas.beginPath(); 
	this.canvas.strokeStyle = this.getColor();
	this.canvas.strokeRect( this.getLeft(),  this.getTop(), 
			        this.getWidth(), this.getHeight() );
    },

    hit: function(x,y) {
	return ( this.getLeft() <= x &&
		 this.getLeft() + this.getWidth() >= x && 
		 this.getTop()  <= y &&
		 this.getTop() + this.getHeight() >= y ); 
    },

    getCenter: function() {
	return { top:  this.getTop()  + (this.getHeight()/2),
		 left: this.getLeft() + (this.getWidth()/2) };
    },

    getBox: function() {
	return { top   : this.getTop(),
		 left  : this.getLeft(),
		 bottom: this.getTop()  + this.getHeight(),
		 right : this.getLeft() + this.getWidth(),
	         height: this.getHeight(),
		 width : this.getWidth() };
    },

    getPort: function(side) {
	switch(side) {
	case "n":
	case "north":
	    return { top : this.getTop(), 
		     left: this.getLeft() + (this.getWidth()/2) };
	    break;
	case "s":
	case "south":
	    return { top : this.getTop()  + this.getHeight(), 
		     left: this.getLeft() + (this.getWidth()/2) };
	    break;
	case "e":
	case "east":
	    return { top : this.getTop()  + (this.getHeight()/2), 
		     left: this.getLeft() + this.getWidth() };
	    break;
	case "w":
	case "west":
	    return { top : this.getTop()  + (this.getHeight()/2), 
		     left: this.getLeft() };
	    break;
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

	if( value == "" ) {
	    value = key;
	    key = "color";
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
