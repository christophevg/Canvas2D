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

    toString: function($super) {
	var s = $super();
	s += "Rectangle " + this.props.name;
	s += "+width=" + this.props.width + " +height=" + this.props.height;
	s += "+color=\"" + this.props.color + "\";";
	return s;
    }
} );
