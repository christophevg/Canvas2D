Canvas2D.ShapeCounter = 0;

Canvas2D.Shape = Class.create( {
    getClass : function getClass() { return this.__CLASS__; },

    initialize: function initialize( props ) {
	props = props || {};

	// preprocess is used to allow Shapes to preprocess the
	// properties before they are automatically initialized
	props = this.preprocess(props);
	this.setProperties(props);

	// setup getters
	this.getPropertyList().each(function propertyListIterator(prop) {
	    var propName = prop.substr(0,1).toUpperCase() + prop.substr(1);
	    var getterName = "get"+propName;
	    if( typeof this[getterName] == "undefined" ) {
		this[getterName] = function() { return this.getProperty(prop);};
	    }
	}.bind(this));

	// postInitialize is used to allow Shapes to do initialization
	// stuff, without the need to override this construtor and
	// make sure it is called correctly
	this.postInitialize();
    },
    
    getPropertyDefault: function getPropertyDefault(prop) {
	var retVal = null;
	this.getClassHierarchy().reverse()
	.each( function classHierarchyIterator(clazz) {
	    if( retVal == null &&
		typeof clazz.Defaults[prop] != "undefined" )
	    {
		retVal = clazz.Defaults[prop];
	    }
	});
	return retVal;
    },

    setProperties : function(props) {
	this.getPropertyList().each(function propertyListIterator(prop) {
	    this[prop] = props[prop] != null ? props[prop] : null;
	}.bind(this) );
	// support for default
	if( !this.name ) { this.name = "__shape__" + Canvas2D.ShapeCounter++; }
    },

    getProperties: function() {
	var props = {};
	var me = this;
	this.getPropertyList().each(function propertyListIterator(prop) {
	    props[prop] = me[prop];
	} );
	props.type = this.getType();
	return props;
    },

    getProperty: function getProperty( prop ) {
	if( typeof this[prop] == "undefined" ) {
	    var propName = prop.substr(0,1).toUpperCase() + prop.substr(1);
	    var getterName = "get"+propName;
	    return this[getterName]();
	} else {
	    return this[prop] != null ? 
		this[prop] : this.getPropertyDefault(prop);
	}
    },

    asConstruct: function() {
	var construct =  
	    { __SHAPE__   : this,
	      annotations : [],
	      type        : this.getType(),
	      name        : this.getName(),
	      supers      : [],
	      modifiers   : {},
	      children    : [],
	      addModifiers: function( props ) {
		  props.each( function(prop) {
		      if( this.__SHAPE__.getProperty( prop ) ) {
			  this.addModifier( prop, 
					    this.__SHAPE__.getProperty(prop) );
		      }
		  }.bind(this) );
	      },
	      addModifier : function( key, value ) {
		  if( this.__SHAPE__.getPropertyDefault( key ) != value ) {
		      this.modifiers[key] = "\"" + value + "\"";
		  }
	      }
	    };

	construct.addModifiers( [ "label", "labelPos", "labelColor" ] );

	return construct;
    },

    constructToString: function(construct, prefix) {
	var string = "";
	construct.annotations.each(function(annotation) {
	    string += prefix + "[@" + annotation + "]\n";
	} );
	string += prefix + construct.type + " " + construct.name;
	construct.supers.each( function(zuper) { string += " : " + zuper; } );
	$H(construct.modifiers).each( function modifierIterator( modifier ) {
	    string += " +" + modifier.key;
	    if( modifier.value ) { string += "=" + modifier.value; }
	} );
	if( construct.children.length > 0 ) {
	    string += " {\n";
	    var me = this;
	    construct.children.each(function childIterator(child) {
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

	    sheet.save();
	    sheet.fillStyle     = this.getLabelColor();
	    sheet.textAlign     = this.getLabelAlign();
	    sheet.font          = this.getLabelFont();
	    sheet.useCrispLines = this.getLabelUseCrispLines();
	    sheet.fillText(this.getLabel(), left, top);
	    sheet.restore();
	}
    },

    render: function(sheet, left, top) {
	sheet.save();
	this.draw     (sheet, left, top);
	this.drawLabel(sheet, left, top);
	sheet.restore();
    },


    // these methods are required and are created when a shape is
    // registered correctly.
    getType            : function() { 
	throw( "Missing getType. Did you register the shape?" ); 
    },
    getClasSHierarchy  : function() { 
	throw( "Missing getClassHierarchy. Did you register the shape?" ); 
    },

    // the remaining methods are not applicable for abstract shapes
    preprocess     : function preprocess(props)      { return props; },
    postInitialize : function postInitialize()       { },
    draw           : function draw(sheet, left, top) { },
    hit            : function hit(x, y)              { return false; },
    hitArea        : function hitArea(l, t, w, h)    { return false; },
    getCenter      : function getCenter()            { return null;  },
    getPort        : function getPort(side)          { return null;  }
} );

// add-in some common functionality
Canvas2D.Shape = Class.create( Canvas2D.Shape, 
			       Canvas2D.Factory.extensions.all.EventHandling );

Canvas2D.Shape.MANIFEST = {
    name : "shape",
    properties: [ "name", "label", "labelPos", "labelColor", "labelAlign",
		  "labelFont", "labelUseCrispLines", "useCrispLines" ]
};

Canvas2D.Shape.manifestHandling = $H( {
    getManifest: function getManifest() {
	return this.MANIFEST || this.__CLASS__.MANIFEST;
    },

    getType: function getType() {
	return this.getManifest().name;
    },

    getTypes: function getTypes() {
	return  [ this.getType(), this.getAliasses() ].flatten();
    },

    getPropertyPath: function getPropertyPath() {
	return this.getManifest().propertyPath || [];
    },

    getClassHierarchy: function getClassHierarchy() {
	var classes = [ Canvas2D.Shape ].concat( this.getPropertyPath() );
	classes.push( this.getClass() );
	return classes;
    },
    
    getLocalProperties: function getLocalProperties() {
	return this.getManifest().properties || [];
    },

    getPropertyList: function getPropertyList() {
	if( !this.allPropertiesCache ) { 
	    this.allPropertiesCache = [];
	    this.getClassHierarchy().each(function propertiesCacheFiller(shape){
		this.allPropertiesCache = 
		    this.allPropertiesCache.concat(shape.getLocalProperties());
	    }.bind(this));
	}
	return this.allPropertiesCache
    },

    getAliasses: function getAliasses() {
	return this.getManifest().aliasses || [];
    },

    getLibraries: function getLibraries() {
	return this.getManifest().libraries || [];
    }
} );

// add manifestHandling functions to each Shape instance and on the
// class itself
Canvas2D.Shape.manifestHandling.each( function(ext) {
    Canvas2D.Shape.prototype[ext.key] = ext.value;
    Canvas2D.Shape[ext.key] = ext.value;
} );
