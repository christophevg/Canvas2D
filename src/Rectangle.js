Canvas2D.Rectangle = Class.create( Canvas2D.Shape, {
    render: function() {
	this.canvas.beginPath(); 
	this.canvas.strokeStyle = this.props.color;
	this.canvas.strokeRect( this.props.left,  this.props.top, 
			        this.props.width, this.props.height );
    },

    hit: function(x,y) {
	return ( this.props.left <= x &&
		 this.props.left + this.props.width >= x && 
		 this.props.top  <= y &&
		 this.props.top + this.props.height >= y ); 
    },

    hitArea: function(left, top, width, height) {
	alert( "Canvas2D.Rectangle::hitArea: not implemented yet" );
    },

    getCenter: function() {
	return { top:  this.props.top  + (this.props.height/2),
		 left: this.props.left + (this.props.width/2) };
    },

    getBox: function() {
	return { top: this.props.top,
		 left: this.props.left,
		 bottom: this.props.top + this.props.height,
		 right: this.props.left + this.props.width,
	         height: this.props.height,
		 width: this.props.width };
    },

    getPort: function(side) {
	switch(side) {
	case "n":
	case "north":
	    return { top: this.props.top, 
		     left: this.props.left + (this.props.width/2) };
	    break;
	case "s":
	case "south":
	    return { top: this.props.top + this.props.height, 
		     left: this.props.left + (this.props.width/2) };
	    break;
	case "e":
	case "east":
	    return { top: this.props.top + (this.props.height/2), 
		     left: this.props.left + this.props.width };
	    break;
	case "w":
	case "west":
	    return { top: this.props.top + (this.props.height/2), 
		     left: this.props.left };
	    break;
	}
    },

    toString: function($super, prefix) {
	var s = $super(prefix);
	s += "Rectangle " + this.props.name;
	s += "+width=" + this.props.width + " +height=" + this.props.height;
	s += "+color=\"" + this.props.color + "\";";
	return s;
    }
} );

Canvas2D.Rectangle.getNames = function() {
    return [ "rectangle", "box" ];
}

Canvas2D.Rectangle.from = function( construct, diagram ) {
    var w = parseInt(construct.modifiers.get( "width"  ).value.value);
    var h = parseInt(construct.modifiers.get( "height" ).value.value);
    var c = construct.modifiers.get( "color"  ).value.value;
    var shape = new Canvas2D.Rectangle({ name: construct.name,
	                                 width: w, height: h, color: c });
    var left, top;
    if( construct.annotation ) {    
	var pos = construct.annotation.data.split(",");
	left = parseInt(pos[0]);
	top  = parseInt(pos[1]);
    } else {
	left = this.offset * ( this.unknownIndex++ );
	top = left;
    }
    shape.setPosition(left,top);
    return shape;
};

Canvas2D.ADLVisitor.registerConstruct(Canvas2D.Rectangle);