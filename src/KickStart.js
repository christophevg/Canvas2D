Canvas2D.KickStart = {};

Canvas2D.KickStart.Starter = Class.extend( {
    init: function() {
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
	    if( classes.contains(this.getTag()) ) {
		var name = htmlCanvas.id;
		var book = this.makeInstance(htmlCanvas);
		if( classes.contains("Tabbed") ) {
		    var tabs = [];
		    if(classes.contains("withSource" )){ tabs.push("source" ); }
		    if(classes.contains("withConsole")){ tabs.push("console"); }
		    if(classes.contains("withAbout"  )){ tabs.push("about"  ); }
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
ProtoJS.mix( Canvas2D.Factory.extensions.all.EventHandling,
	     Canvas2D.KickStart.Starter.prototype );

Canvas2D.KickStarter = new Canvas2D.KickStart.Starter();
ProtoJS.Event.observe( window, 'load', 
		       function() { Canvas2D.KickStarter.start(); } );

Canvas2D.KickStarter.on( "ready",
			  function() { Canvas2D.fireEvent( "ready" );} );
