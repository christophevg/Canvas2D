Canvas2D.KickStart = {};

Canvas2D.KickStart.Starter = Class.create( {
    getTag: function() {
	return "Canvas2D";
    },

    makeInstance: function( name ) {
	return new Canvas2D.Canvas(name);
    },   

    start: function() {
	var htmlCanvases = document.getElementsByTagName( "canvas" );
	for(var c=0; c<htmlCanvases.length; c++ ) {
	    var htmlCanvas = htmlCanvases[c];
	    var classes = htmlCanvas.className;
	    if( classes.include(this.getTag()) ) {
		var name = htmlCanvas.id;
		var canvas = this.makeInstance(name); 
		if( classes.include("Tabbed") ) {
		    var tabs = [];
		    if(classes.include("withSource" )) { tabs.push("source" ); }
		    if(classes.include("withConsole")) { tabs.push("console"); }
		    if(classes.include("withAbout"  )) { tabs.push("about"  ); }
		    canvas.makeTabbed(tabs); 
		}
		var sourceElement = document.getElementById(name+"Source")
		if( sourceElement ) {
		    var source;
		    try {
			// some HTML element, PRE, DIV, ...
			source = sourceElement.firstChild.nodeValue;
		    } catch(err) {
			// TEXTAREA
			source = sourceElement.value;
		    }
		    canvas.load(source);
		}
	    }
	}
    }
} );

Canvas2D.KickStarter = new Canvas2D.KickStart.Starter();
Event.observe(window, 'load', function() { Canvas2D.KickStarter.start(); } );
