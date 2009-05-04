Canvas2D.KickStart = {};

Canvas2D.KickStart.Starter = Class.create( {
    initialize: function() {
	this.manager = new Canvas2D.Manager();
    },
    
    getTag: function() {
	return "Canvas2D";
    },

    makeInstance: function( name ) {
	return this.manager.setupBook(name);
    },   

    start: function() {
	var htmlCanvases = document.getElementsByTagName( "canvas" );
	for(var c=0; c<htmlCanvases.length; c++ ) {
	    var htmlCanvas = htmlCanvases[c];
	    var classes = htmlCanvas.className;
	    if( classes.include(this.getTag()) ) {
		var name = htmlCanvas.id;
		var book = this.makeInstance(name); 
		if( classes.include("Tabbed") ) {
		    var tabs = [];
		    if(classes.include("withSource" )) { tabs.push("source" ); }
		    if(classes.include("withConsole")) { tabs.push("console"); }
		    if(classes.include("withAbout"  )) { tabs.push("about"  ); }
		    book.makeTabbed(tabs); 
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
		    book.load(source);
		}
	    }
	}
	this.fireEvent( "ready" );
	this.manager.startAll();
    }
} );


// add-in some common functionality
Canvas2D.KickStart.Starter =
    Class.create( Canvas2D.KickStart.Starter,
		  Canvas2D.Factory.extensions.all.EventHandling );

Canvas2D.KickStarter = new Canvas2D.KickStart.Starter();
Event.observe(window, 'load', function() { Canvas2D.KickStarter.start(); } );
