Canvas2D.CanvasBase = Class.create( Canvas2D.ICanvas, {
    initialize: function(element) {
	unless( element && element.nodeType && 
		element.nodeType == Node.ELEMENT_NODE, 
		function() {
		    alert( "CanvasBase:initialize: expected HTMLElement" );
		} );
	this.htmlcanvas = element;
	this.canvas = this.htmlcanvas.getContext("2d");
    },

    save         : function() { 
	var oldValues = {};
	var currentValues = this;
	$H(Canvas2D.Defaults.Canvas).keys().each(function(prop) {
	      oldValues[prop] = currentValues[prop];
	  } );
	this.oldValues = oldValues;
	this.canvas.save(); 
    },
    restore      : function() { 
	var oldValues = this.oldValues;
	var currentValues = this;
	$H(Canvas2D.Defaults.Canvas).keys().each(function(prop) {
	      currentValues[prop] = oldValues[prop];
	  } );
	this.canvas.restore();
    },

    transferProperties : function() {
	var canvas = this.canvas;
	var currentValues = this;
	$H(Canvas2D.Defaults.Canvas).each(function(prop) {
	    canvas[prop.key] = currentValues[prop.key] || prop.value;
	} );
    },

    adjustToAlignment : function(x, text) {
	switch(this.textAlign) {
	case "center": x -= this.measureText(text) / 2; break;
	case "right":  x -= this.measureText(text);     break;
	}
	return x;
    }
} );
