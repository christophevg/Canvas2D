Canvas2D.Compositors = {
    "vertical-stack": Class.extend( {
	nextPosition: function(left, top, child) {
	    return { left: left, top: top+child.getHeight() };
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
	nextPosition: function(left, top, child) {
	    return { left: left+child.getWidth(), top: top };
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
	props.composition = new Canvas2D.Compositors[props.composition]();
	return props;
    },

    draw: function(sheet, left, top) {
	// temp
	//console.log( left + ", " + top + " : " + this.getWidth() + " x " + this.getHeight() );
	//sheet.strokeRect( left, top, this.getWidth(), this.getHeight() );

	this.getChildren().iterate( function(child) {
	    child.render(sheet, left, top );
	    var pos = this.composition.nextPosition(left, top, child);
	    left = pos.left; top = pos.top;
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
