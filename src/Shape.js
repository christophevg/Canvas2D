Canvas2D.Shape = Class.create( {
    allProperties: function() {
	return new Array( "name", 
			  "label", "labelPos", "labelColor",
			  "left", "top" );
    },

    getType : function() { return "shape"; },

    initialize: function( props ) {
	var me = this;
	this.allProperties().each(function(prop) {
	    me[prop] = props[prop] || null;
	} );
    },
    
    getName  : function() { return this.name;   },

    getLabel      : function() { return this.label;      },
    getLabelPos   : function() { return this.labelPos;   },
    getLabelColor : function() { return this.labelColor; },

    getLeft  : function() { return this.left;   },
    getTop   : function() { return this.top;    },

    getProperties: function() {
	var props = {};
	var me = this;
	this.allProperties().each(function(prop) {
	    props[prop] = me[prop];
	} );
	return props;
    },

    setCanvas: function( canvas2d ) {
	this.canvas = canvas2d;
    },

    setPosition: function( left, top ) {
	this.left = left;
	this.top  = top;
	this.forceRedraw();
	return this;
    },

    forceRedraw: function() {
	if(!this.canvas) { return; };
	this.canvas.render();
    },

    getPosition: function() {
	return { left: this.left, top : this.top };
    },

    move: function( dleft, dtop ) {
	this.left += dleft;
	this.top  += dtop;
	this.canvas.fireEvent( "moveShape", this.getProperties() );
	this.forceRedraw();
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
	if( this.getLeft() != null && this.getTop() != null ) {
	    construct.annotations.push( this.getLeft() + "," + this.getTop() );
	}
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
	string += construct.type + " " + construct.name;
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

    drawLabel: function() {
	if( this.getLabel() && this.getBox() ) {
	    this.canvas.strokeStyle = this.getLabelColor() || "black";
	    var left = this.getCenter().left;
	    var top  = this.getCenter().top + 2.5;

	    switch( this.getLabelPos() ) {
	    case "top":	            top  = this.getBox().top - 5;      break;
	    case "bottom":          top  = this.getBox().bottom + 11;  break;
	    case "center": default: top  = this.getCenter().top + 2.5;
	    }
	    this.canvas.drawTextCenter("Sans", 10, left, top, this.getLabel());
	}
    },

    render: function() {
	this.draw();
	this.drawLabel();
    },

    // the remaining methods are not applicable for abstract shapes
    getNames    : function() { return []; },
    getBox      : function() { return null; },
    draw        : function() { },
    hit         : function(x,y) { return false; },
    hitArea     : function(left, top, width, height) { return false; },
    getCenter   : function() { return null; },
    getPort     : function(side) { }
} );
