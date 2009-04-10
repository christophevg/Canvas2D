Canvas2D.ShapeCounter = 0;

Canvas2D.Shape = Class.create( {
    getClass : function() { return Canvas2D.Shape; },
    getType  : function() { return "shape";        },
    getAllProperties : function() {
	return [ "name", "label", "labelPos", "labelColor", "useCrispLines" ];
    },

    getClassHierarchy : function() {
	return [ Canvas2D.Shape ];
    },

    initialize: function( props ) {
	props = props || {};

	// preprocess is used to allow Shapes to preprocess the
	// properties before they are automatically initialized
	props = this.preprocess(props);
	this.setProperties(props);

	// setup getters
	this.getAllProperties().each(function(prop) {
	    var propName = prop.substr(0,1).toUpperCase() + prop.substr(1);
	    var getterName = "get"+propName;
	    if( typeof this[getterName] == "undefined" ) {
		this[getterName] = function() {
		    var retVal = null;
		    if( typeof this[prop] != "undefined"  &&
			this[prop] != null )
		    {
			retVal = this[prop];
		    } else {
			var classes = this.getClassHierarchy();
			classes.reverse().each(function(clazz){
			    if( retVal == null &&
				typeof clazz.Defaults[prop] != "undefined" )
			    {
				retVal = clazz.Defaults[prop];
			    }
			});
		    }
		    return retVal;
		};
	    }
	}.bind(this));
	// setup is used to allow Shapes to do initialization stuff,
	// without the need to override this construtor and make sure
	// it is called correctly
	this.setup();
    },
    
    setProperties : function(props) {
	this.getAllProperties().each(function(prop) {
	    this[prop] = props[prop] != null ? props[prop] : null;
	}.bind(this) );
	// support for default
	if( !this.name ) { this.name = "__shape__" + Canvas2D.ShapeCounter++; }
    },

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
	    sheet.fillStyle     = this.getLabelColor();
	    sheet.textAlign     = "center";
	    sheet.font          = "7pt Sans-Serif";
	    sheet.useCrispLines = false;
	    sheet.fillText(this.getLabel(), left, top);
	    sheet.useCrispLines = true;
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
