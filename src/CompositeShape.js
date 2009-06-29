Canvas2D.CompositeShape = Class.create( Canvas2D.Shape, {
    postInitialize: function postInitialize() {
	this.children = [];
    },

    draw: function(sheet, left, top) {
	this.prepareChildren(sheet);
	this.decorate(sheet, left, top);
	this.getChildren().each( function(child) {
	    this.decorateChild(sheet, left, top, child);
	    child.render(sheet, left, top );
	    var pos = this.nextPosition(left, top, child);
	    left = pos.left; top = pos.top;
	}.bind(this) );
    },

    getChildren: function getChildren() {
	return this.children;
    },

    prepareChildren: function prepareChildren(sheet) {
	this.children.each( function(child) { 
	    child.prepare(sheet);
	} );
    },

    decorate     : function( sheet, left, top ) { },
    decorateChild: function( sheet, left, top, child ) { },

    add: function add(shape) {
	// TODO add Position
	this.prepareChild(shape);
	this.children.push(shape);
    },

    prepareChild: function(child) {},

    hit: function(x,y) { 
	
	return false;
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
	// TODO ?
	return construct;
    }
} );

Canvas2D.CompositeShape.MANIFEST = {
    name         : "compositeShape",
    properties   : []
};

Canvas2D.registerShape( Canvas2D.CompositeShape );
