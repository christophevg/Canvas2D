Canvas2D.ShapeCounter = 0;

Canvas2D.Shape = Class.create( {
    allProperties: function() {
	var base = [ "name", "label", "labelPos", "labelColor" ];
	var ext  = this.myProperties();
	return base.concat(ext);
    },

    getType : function() { return "shape"; },

    initialize: function( props ) {
	props = props || {};
	// preprocess is used to allow Shapes to preprocess the
	// properties before they are automatically initialized
	props = this.preprocess(props);
	this.allProperties().each(function(prop) {
	    this[prop] = props[prop] != null ? props[prop] : null;
	}.bind(this) );
	if( !this.name ) { this.name = "__shape__" + Canvas2D.ShapeCounter++; }
	// setup is used to allow Shapes to do initialization stuff,
	// without the need to override this construtor and make sure
	// it is called correctly
	this.setup();
    },
    
    getName       : function() { return this.name;   },

    getLabel      : function() { return this.label;      },
    getLabelPos   : function() { return this.labelPos;   },
    getLabelColor : function() { return this.labelColor; },

    getProperties: function() {
	var props = {};
	var me = this;
	this.allProperties().each(function(prop) {
	    props[prop] = me[prop];
	} );
	props.type = this.getType();
	return props;
    },

    asConstruct: function() {
	var construct =  
	    { annotations : [],
	      type        : this.getType(),
	      name        : this.getName(),
	      supers      : [],
	      modifiers   : {},
	      children    : []
	    };
	if( this.getLabel() ) {
	    construct.modifiers.label = "\"" + this.getLabel() + "\"";
	}
	if( this.getLabelPos() ) {
	    construct.modifiers.labelPos = "\"" + this.getLabelPos() + "\"";
	}
	if( this.getLabelColor() ) {
	    construct.modifiers.labelColor = "\"" + this.getLabelColor() + "\"";
	}
	return construct;
    },

    constructToString: function(construct, prefix) {
	var string = "";
	construct.annotations.each(function(annotation) {
	    string += prefix + "[@" + annotation + "]\n";
	} );
	string += prefix + construct.type + " " + construct.name;
	construct.supers.each( function(zuper) { string += " : " + zuper; } );
	$H(construct.modifiers).each( function( modifier ) {
	    string += " +" + modifier.key;
	    if( modifier.value ) { string += "=" + modifier.value; }
	} );
	if( construct.children.length > 0 ) {
	    string += " {\n";
	    var me = this;
	    construct.children.each(function(child) {
		string += me.constructToString(child, prefix + "  " ) + "\n";
	    } );
	    string += prefix + "}";
	} else {
	    string += ";";
	}
	return string;
    },

    toADL: function(prefix) {
	return this.constructToString(this.asConstruct(), prefix);
    },

    delayRender: function() {
	return false;
    },

    drawLabel: function(sheet, left, top) {
	if( this.getLabel() && this.getHeight() != null && this.getCenter() ) {
	    left += this.getCenter().left;
	    
	    switch( this.getLabelPos() ) {
	    case "top":	            top  += - 5;   break;
	    case "bottom":          top  += this.getHeight() + 11;  break;
	    case "center": default: top  += this.getCenter().top + 2.5;
	    }
	    // NOTE: don't use with() here, because with() doesn't do getters
	    sheet.save();
	    sheet.strokeStyle = this.getLabelColor() || "black";
	    sheet.textAlign   = "center";
	    sheet.font        = "7pt Sans-Serif";
	    sheet.fillText(this.getLabel(), left, top);
	    sheet.restore();
	}
    },

    render: function(sheet, left, top) {
	this.draw     (sheet, left, top);
	this.drawLabel(sheet, left, top);
    },

    // the remaining methods are not applicable for abstract shapes
    preprocess  : function(props)                    { return props; },
    setup       : function()                         { },
    myProperties: function()                         { return [];    },
    getWidth    : function()                         { return 0;     },
    getHeight   : function()                         { return 0;     },
    getNames    : function()                         { return [];    },
    draw        : function(sheet, left, top)         { },
    hit         : function(x, y)                     { return false; },
    hitArea     : function(left, top, width, height) { return false; },
    getCenter   : function()                         { return null;  },
    getPort     : function(side)                     { }
} );

// add-in some common functionality
Canvas2D.Shape = Class.create( Canvas2D.Shape, 
			       Canvas2D.Factory.extensions.EventHandling );
