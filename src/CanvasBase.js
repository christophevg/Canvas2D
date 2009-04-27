Canvas2D.CanvasBase = Class.create( Canvas2D.ICanvas, {
    initialize: function(ctx) {
	this.htmlcanvas = ctx.canvas;
	this.canvas     = ctx;
	this.savedValues = [];
	this.setupProperties();
	$H(Canvas2D.Defaults.Canvas).keys().each(function(prop) {
	    this[prop] = Canvas2D.Defaults.Canvas[prop];
	}.bind(this) );
    },

    save : function() {
	var oldValues = {};
	var currentValues = this;
	$H(Canvas2D.Defaults.Canvas).keys().each(function(prop) {
	    oldValues[prop] = currentValues[prop];
	} );
	this.savedValues.push(oldValues);
	this.canvas.save(); 
    },
    restore : function() {
	var oldValues = this.savedValues.pop();
	var currentValues = this;
	$H(Canvas2D.Defaults.Canvas).keys().each(function(prop) {
	    currentValues[prop] = oldValues[prop];
	} );
	this.canvas.restore();
    },

    setupProperties : function() {
	if( typeof Object.__defineGetter__ !== "function" ) { return; }
	$H(Canvas2D.Defaults.Canvas).each(function(prop) {
	    this.__defineGetter__(prop.key, function() {
		return this.canvas[prop.key];
	    } );
	    this.__defineSetter__(prop.key, function(val){
		this.canvas[prop.key] = val;
	    } );
	}.bind(this) );
    },

    transferProperties : function() {
	if( typeof Object.__defineGetter__ === "function" ) { return; }
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
