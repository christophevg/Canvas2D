Canvas2D.Kickstart = function() {
    var canvases = document.getElementsByTagName( "canvas" );
    for(var c=0; c<canvases.length; c++ ) {
	var canvas = canvases[c];
	if( canvas.className == "Canvas2D" ) {
	    var name = canvas.id;
	    var diagram = new Canvas2D.Canvas(name); 
	    diagram.makeDynamic();
	    diagram.makeTabbed( [ "source", "console", "about" ]); 
	    
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
		diagram.show(source);
	    }
	}
    }
}

Event.observe(window, 'load', Canvas2D.Kickstart );
