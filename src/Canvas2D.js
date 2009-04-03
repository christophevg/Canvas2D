// namespace for holding all Canvas2D related classes, functions and extensions
var Canvas2D = {};

// global placeholder for extensions to register
Canvas2D.extensions = [];

// one-shot activation of a Canvas
Canvas2D.activate = function(canvasId) {
    var canvas = document.getElementById(canvasId);
    if(canvas) {
	var manager = new Canvas2D.Manager();
	var canvas  = manager.setupBook(canvasId);
	var sheet   = canvas.addSheet();
	manager.startAll();
	return sheet;
    }
    throw( canvasId + " does not reference a known id on the document." );
};
