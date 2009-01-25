Canvas2D.Shape = Class.create( {
    initialize: function( props ) {
	this.props = props;
    },

    getName: function() {
	return this.props.name;
    },

    getProperties: function() {
	return { type: "Shape",
		 left: this.props.left,
		 top: this.props.top,
		 width: this.props.width,
		 height: this.props.height };
    },

    setCanvas: function( canvas2d ) {
	this.canvas = canvas2d;
    },

    setPosition: function( left, top ) {
	this.props.left = left;
	this.props.top  = top;
	this.forceRedraw();
    },

    forceRedraw: function() {
	if(!this.canvas) { return; };
	this.canvas.render();
    },

    getPosition: function() {
	return { left: this.props.left, 
		 top : this.props.top };
    },

    move: function( dleft, dtop ) {
	this.props.left += dleft;
	this.props.top  += dtop;
	this.canvas.fireEvent( "selectShape", this.getProperties() );
	this.forceRedraw();
    },

    toString: function(prefix) {
	prefix = prefix || "";
	if( this.props.left == null || this.props.top == null ) { 
	    return prefix; 
	}
	return prefix + "[@" + this.props.left + "," + this.props.top + "] ";
    },

    // the remaining methods are not applicable for abstract shapes
    getNames  : function() { return []; },
    getBox    : function() { return null; },
    render    : function() { },
    hit       : function(x,y) { return false; },
    hitArea   : function(left, top, width, height) { return false; },
    getCenter : function() { return null; },
    getPort   : function(side) { }
} );
