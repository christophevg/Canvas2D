Canvas2D.Kickstart = function() {
    var htmlCanvases = document.getElementsByTagName( "canvas" );
    for(var c=0; c<htmlCanvases.length; c++ ) {
	var htmlCanvas = htmlCanvases[c];
	var classes = htmlCanvas.className;
	if( classes.include("Canvas2D") ) {
	    var name = htmlCanvas.id;
	    var canvas = new Canvas2D.Canvas(name); 
	    if( classes.include("Tabbed") ) {
		var tabs = [];
		if( classes.include("withSource" ) ) { tabs.push("source" ); }
		if( classes.include("withConsole") ) { tabs.push("console"); }
		if( classes.include("withAbout"  ) ) { tabs.push("about"  ); }
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

Event.observe(window, 'load', Canvas2D.Kickstart );
