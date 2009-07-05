Canvas2D.Stack = Canvas2D.CompositeShape.extend( {
    decorate: function decorate(sheet, left, top) {
	if( this.getBorderWidth() > 0 ) {
	    sheet.useCrispLines = this.getUseCrispLines();
	    sheet.lineWidth = this.getBorderWidth();
	    sheet.strokeStyle = this.getBorderColor();
	    sheet.fillStyle = this.getFillColor();
	    sheet.fillRect( left, top, this.getWidth(), this.getHeight() );
	    sheet.strokeRect( left, top, this.getWidth(), this.getHeight() );
	}
    },

    getWidth: function getWidth() {
	var width = 0;
	this.children.iterate( function(child) {
	    var w = child.getWidth() + this.getChildPadding() * 2;
	    if( this.getOrientation() == "we" ||
		this.getOrientation() == "ew" ) 
	    {
		width += w;
	    } else {
		if( w > width ) { width = w; }
	    }
	}.scope(this) );
	return width;
    },

    getHeight: function getHeight() {
	var height = 0;
	this.children.iterate( function(child) {
	    var h = child.getHeight() + this.getChildPadding() * 2;
	    if( this.getOrientation() == "we" ||
		this.getOrientation() == "ew" ) 
	    { 
		if( h > height ) { height = h; }
	    } else {
		height += h;
	    }
	}.scope(this) );
	return height;
    },

    decorateChild: function decorateChild(sheet, left, top, child) {
	// TODO
    },

    prepare: function preprare(sheet) {
	this.prepareChildren(sheet);
    },

    prepareChild: function prepareChild(child) {
	child.topDown = true;
    },
    
    nextPosition: function nextPosition(left, top, child ) {
	if( this.getOrientation() == "we" ||
	    this.getOrientation() == "ew" ) 
	{ 
	    return { left : left + child.getWidth(),
		     top  : top };
	} else {
	    return { left : left,
		     top  : top + child.getHeight() };
	}
    },

    getChildren: function getChildren() {
	if( this.getOrientation() == "sn" ||
	    this.getOrientation() == "ew" ) 
	{
	    return this._super().reverse();
	} else {
	    return this._super();
	}
    },

    asConstruct: function() {
	var construct = this._super();
	// TODO
	return construct;
    }
} );

Canvas2D.Stack.from = function( construct, parent ) {
    var props = { name: construct.name };
    construct.modifiers.iterate(function(key, value) {
	value = ( typeof value.value != "undefined" ? 
		  value.value.value : "" );
	props[key] = value;
    } );

    return new Canvas2D.Stack(props);
};

Canvas2D.Stack.MANIFEST = {
    name         : "stack",
    properties   : [ "borderWidth", "borderColor", "fillColor", "orientation",
		     "childSpacing", "childPadding" ],
    propertyPath : [ Canvas2D.Shape, Canvas2D.CompositeShape ],
    libraries    : [ "Canvas2D" ]
};

Canvas2D.registerShape( Canvas2D.Stack );
