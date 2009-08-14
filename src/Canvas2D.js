// namespace for holding all Canvas2D related classes, functions and extensions
var Canvas2D = {
    // all known/registered shapes that can be used on this canvas
    shapes: $H(),

    // libraries are groups of shapes
    libraries: $H(),

    // global placeholder for extensions to register
    extensions: [],

    // one-shot activation of a Canvas
    activate: function activate(canvasId) {
	var canvas = document.getElementById(canvasId);
	if(canvas) {
	    var manager = new Canvas2D.Manager();
	    var canvas  = manager.setupBook(canvasId);
	    var sheet   = canvas.addSheet();
	    manager.startAll();
	    return sheet;
	}
	throw( canvasId + " does not reference a known id on the document." );
    },

    // method to register a shape
    registerShape: function registerShape(shape) {
	// let's store a reference to the class in the prototype itself
	shape.prototype.__CLASS__ = shape;
	shape.prototype.getClass = function getClass() { return this.__CLASS__; }

	// mixin static methods for dealing with manifests
	Canvas2D.Shape.manifestHandling.iterate( function(key, value) {
	    shape[key] = value;
	} );

	// register shape with all names (including aliasses)
	shape.getTypes().iterate(function(name) {
	    Canvas2D.shapes.set(name, shape);
	} );

	// add shape to libraries
	shape.getLibraries().iterate(function(library) {
	    if( !Canvas2D.libraries.get(library) ) { 
		Canvas2D.libraries.set(library, []);
	    }
	    Canvas2D.libraries.get(library).push(shape);
	} );
    },

    getBook : function(id) {
	return Canvas2D.KickStarter.manager.getBook(id);
    }
};
