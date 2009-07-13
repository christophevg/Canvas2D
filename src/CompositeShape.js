Canvas2D.Compositors = {
    "vertical-stack": Class.extend( {
	init: function init(args, shape) {
	    this.align = args.contains("center") ? "center" :
		args.contains("right") ? "right" : "left";
	    this.left = 0;
	    this.top = 0;
	    this.shape = shape;
	},

	getPadding: function getPadding() {
	    return parseInt(this.shape.padding ? this.shape.padding : 0);
	},

	getPosition: function(child) {
	    var dleft = this.getPadding();
	    var width = this.shape.grow ? this.shape.getParent().getWidth() 
		: this.getWidth();
	    if( this.align == "center" ) {
		dleft = ( width - child.getWidth() ) / 2;
	    } else if( this.align == "right" ) {
		dleft = width -  child.getWidth() - this.getPadding();
	    }
	    var top = this.top;
	    this.top += child.getHeight(); // for next child
	    return { left: this.left + dleft, 
		     top: top + this.getPadding() };
	},

	getWidth: function getWidth() {
	    // max width of all children
	    var width = 0;
	    this.shape.getChildren().iterate( function(child) {
		width = child.getWidth() > width ?
		    child.getWidth() : width;
	    });
	    return width + this.getPadding() * 2;
	},

	getChildWidth: function getChildWidth() {
	    return this.getWidth();
	},

	getHeight: function getHeight() {
	    // sum of all children's height
	    var height = 0;
	    this.shape.getChildren().iterate( function(child) {
		height += child.getHeight();
	    });
	    return height + this.getPadding() * 2;
	},

	getChildHeight: function getChildHeight() {
	    return null;
	}
    }),

    "horizontal-stack": Class.extend( {
	init: function init(args, shape) {
	    this.align = args.contains("top") ? "top" :
		args.contains("bottom") ? "bottom" : "center";
	    this.left = 0;
	    this.top = 0;
	    this.shape = shape;
	},
	
	getPosition: function(child) {
	    var dtop = 0;
	    var height = this.shape.grow ? this.shape.getParent().getHeight()
		: this.getHeight();
	    if( this.align == "center" ) {
		dtop = ( height - child.getHeight() ) / 2;
	    } else if( this.align == "bottom" ) {
		dtop = height - child.getHeight();
	    }
	    var left = this.left;
	    this.left += child.getWidth(); // next child
	    return { left: left, top: this.top + dtop };
	},

	getWidth: function getWidth() {
	    // sum of all children's width
	    var width = 0;
	    this.shape.getChildren().iterate( function(child) {
		width += child.getWidth();
	    });
	    return width;
	},

	getChildWidth: function getChildWidth() {
	    return null;
	},

	getHeight: function getHeight() {
	    // max height of all children
	    var height = 0;
	    this.shape.getChildren().iterate( function(child) {
		height = child.getHeight() > height ? 
		    child.getHeight() : height;
	    });
	    return height;
	},

	getChildHeight: function getChildHeight() {
	    return this.getHeight();
	}
    })
};

Canvas2D.CompositeShape = Canvas2D.Shape.extend( {
    postInitialize: function postInitialize() {
	this.children = [];
    },

    getChildren: function getChildren() {
	return this.children;
    },

    preprocess: function preprocess(props) {
	props.composition = props["composition"] || "vertical-stack";
	var args = [];
	if( props.composition.contains( ":" ) ) {
	    args = props.composition.split(":");
	    props.composition = args.shift();
	}
	props.composition = 
	    new Canvas2D.Compositors[props.composition](args, this);
	return props;
    },

    draw: function(sheet, left, top) {
	this.getChildren().iterate( function(child) {
	    var d = this.composition.getPosition(child, this.getChildren());
	    child.render(sheet, left + d.left, top + d.top );
	}.scope(this) );
    },

    prepareChildren: function prepareChildren(sheet) {
	this.getChildren().iterate( function(child) {
	    child.prepare(sheet);
	} );
    },

    prepare: function prepare(sheet) {
	this.prepareChildren(sheet);
	this.width  = this.composition.getWidth();
	this.height = this.composition.getHeight();
    },

    getChildWidth: function getChildWidth() {
	return this.composition.getChildWidth();
    },

    getChildHeight: function getChildHeight() {
	return this.composition.getChildHeight();
    },

    getChildren: function getChildren() {
	return this.children;
    },

    add: function add(child) {
	child.topDown = true; // this forces text to draw from the top down
	this.children.push(child);
	child.setParent(this);
    },

    asConstruct: function($super) {
	var construct = $super();
	// TODO
	return construct;
    }
} );

Canvas2D.CompositeShape.from = function( construct, sheet ) {
    var props = { name: construct.name };
    construct.modifiers.iterate(function(key, value) {
	value = ( value.value ? value.value.value : "" );

	if( "" + value == "" ) {
	    value = key;
	    key = "composition";
	}

	props[key] = value;
    } );

    return new Canvas2D.CompositeShape(props);
};

Canvas2D.CompositeShape.MANIFEST = {
    name         : "compositeShape",
    aliasses     : [ "group" ],
    properties   : [ "width", "height", "composition", "padding" ]
};

Canvas2D.registerShape( Canvas2D.CompositeShape );
