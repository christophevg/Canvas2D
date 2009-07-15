var scripts = [ 
    "../lib/ProtoJS/build/ProtoJS.js",
    "../lib/excanvas.js",
    "../lib/canvastext.js",
    "../lib/tabber/tabber.js",
    "../lib/ADL/build/ADL.shared.js",
    
    "../src/DepCheck.js", 
    "../src/SanityChecks.js", 
    "../src/Common.js", 
    "../src/Canvas2D.js", 
    "../src/Factory.js", 
    "../src/Keyboard.js", 
    "../src/ImageManager.js", 
    "../src/Manager.js", 
    "../src/ADLVisitor.js", 
    "../src/Book.js", 
    "../src/Shape.js", 
    "../src/Sheet.js", 
    "../src/Position.js", 
    "../src/Rectangle.js", 
    "../src/Connector.js", 
    "../src/Line.js", 
    "../src/LinePath.js", 
    "../src/Text.js", 
    "../src/Image.js", 
    "../src/Alias.js", 
    "../src/Arrow.js",
    "../src/plugins/TabbedCanvas.js", 
    "../src/plugins/AutoLayout.js", 
    "../src/KickStart.js", 
    
    "../src/Defaults.js" 
];

function addScript(url, callback) {
    var e = document.createElement("script");
    e.src = url;
    e.type="text/javascript";
    // schedule next script
    // most browsers
    e.onload = callback;
    // IE 6 & 7
    e.onreadystatechange = function() {
	if (this.readyState == 'complete') {
	    callback();
	}
    }	
    document.getElementsByTagName("head")[0].appendChild(e); 
}

var count = 0;

function loadScripts() {
    if( count < scripts.length ) {
	addScript( scripts[count], loadScripts );
	count++;
    } else {
	if( typeof startIt == "function" ) { startIt(); }
	else if( typeof drawIt == "function" ) { drawIt(); }
//	else { window.onload(); }
    }
}

function addScript(url) {
    document.writeln( "<script type=\"text/javascript\" src=\"" + url + "\"></script>" );
}

function loadScripts() {
    for( var i=0; i<scripts.length; i++ ) {
	addScript(scripts[i]);
    }
}

loadScripts();
