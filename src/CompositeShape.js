Canvas2D.Compositors = {
    "vertical-stack": Class.extend( {
	init: function init(args) {
	    this.align = args.contains("center") ? "center" :
		args.contains("right") ? "right" : "left";
	    this.left = 0;
	    this.top = 0;
	},

	getPosition: function(child, children) {
	    var dleft = 0;
	    if( this.align == "center" ) {
		dleft = ( this.getWidth(children) - child.getWidth() ) / 2;
	    } else if( this.align == "right" ) {
		dleft = this.getWidth(children) - child.getWidth();
	    }
	    var top = this.top;
	    this.top += child.getHeight();
	    return { left: this.left + dleft, top: top };
	},

	getWidth: function getWidth(children) {
	    // max width of all children
	    var width = 0;
	    children.iterate( function(child) {
		width = child.getWidth() > width ?
		    child.getWidth() : width;
	    });
	    return width;
	},

	getHeight: function getHeight(children) {
	    // sum of all children's height
	    var height = 0;
	    children.iterate( function(child) {
		height += child.getHeight() > height ? 
		    child.getHeight() : height;
	    });
	    return height;
	}
    }),

    "horizontal-stack": Class.extend( {
	init: function init(args) {
	    this.align = args.contains("top") ? "top" :
		args.contains("bottom") ? "bottom" : "center";
	    this.left = 0;
	    this.top = 0;
	},
	
	getPosition: function(child, children) {
	    var dtop = 0;
	    if( this.align == "center" ) {
		dtop = ( this.getHeight(children) - child.getHeight() ) / 2;
	    } else if( this.align == "bottom" ) {
		dtop = this.getHeight(children) - child.getHeight();
	    }
	    var left = this.left;
	    this.left += child.getWidth();
	    return { left: left, top: this.top + dtop };
	},

	getWidth: function getWidth(children) {
	    // sum of all children's width
	    var width = 0;
	    children.iterate( function(child) {
		width += child.getWidth();
	    });
	    return width;
	},

	getHeight: function getHeight(children) {
	    // max height of all children
	    var height = 0;
	    children.iterate( function(child) {
		height = child.getHeight() > height ? 
		    child.getHeight() : height;
	    });
	    return height;
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
	props.composition = new Canvas2D.Compositors[props.composition](args);
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
	this.width  = this.composition.getWidth(this.getChildren());
	this.height = this.composition.getHeight(this.getChildren());
    },

    getChildren: function getChildren() {
	return this.children;
    },

    add: function add(child) {
	child.topDown = true;
	this.children.push(child);
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
    properties   : [ "width", "height", "composition" ]
};

Canvas2D.registerShape( Canvas2D.CompositeShape );
