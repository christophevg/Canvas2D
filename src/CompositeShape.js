Canvas2D.CompositeShape = Canvas2D.Shape.extend( {
    hasChildren: function hasChildren() {
	return this.getChildren().length > 0;
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

    getWidth: function getWidth(withoutGrowth) {
	if( this.grows 
	    && this.getParent().composition.widthGrows() 
	    && !withoutGrowth ) {
	    return this.getParent().getWidth(withoutGrowth);
	}

	if( this.hasChildren() ) {
	    return max( this.composition.getWidth(), this.width );
	}

	return this.width;
    },

    getHeight: function getHeight(withoutGrowth) {
	if( this.grows 
	    && this.getParent().composition.heightGrows() 
	    && !withoutGrowth ) 
	{
	    return this.getParent().getHeight(withoutGrowth);
	}

	if( this.hasChildren() ) {
	    return max( this.composition.getHeight(), this.height );
	}

	return this.height;
    },
    
    getChildren: function getChildren() {
	if(!this.children) { this.children = []; }
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

    prepare: function(sheet) {
	this._super();
	if( this.hasChildren() ) {
	    this.prepareChildren(sheet);
	    this.composition.prepare();
	}
    },

    prepareChildren: function prepareChildren(sheet) {
	this.getChildren().iterate( function(child) {
	    child.prepare(sheet);
	} );
    },

    add: function add(child) {
	child.topDown = true; // this forces text to draw from the top down
	this.getChildren().push(child);
	child.setParent(this);
    },

    asConstruct: function() {
	var construct = this._super();
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
    properties   : [ "width", "height", "grows", "composition", "padding" ]
};

Canvas2D.registerShape( Canvas2D.CompositeShape );
