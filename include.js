(function(project, scripts) {
	var cwd = (function cwd() {
		var scripts = document.getElementsByTagName('script');
		var re = new RegExp( project + "\/include\.js$");
		for( var i in scripts) {
			if( scripts[i].src && scripts[i].src.match( re ) ) {
				return scripts[i].src.replace(/(.*)include\.js$/, '$1');
			}
		}
	})();

	var include = function include(url) {
		document.writeln( "<script type=\"text/javascript\" " + 
											"        src=\"" + url + "\"></scr" + "ipt>" );
	}

	for( var i=0; i<scripts.length; i++ ) {
		include( cwd + scripts[i]);
	}
})
(
	
// The name of the project is needed to select the correct include.js file.
// When reusing projects with nested include files this might be required.
"Canvas2D",

// The following list are the separate Javascript files, in order, to be 
// loaded. They are relative to this include file.
[ 
    "lib/ProtoJS/include.js",
    "lib/ADL/include.js",
    "lib/excanvas.js",
    "lib/canvastext.js",
    "lib/tabber.js",
    
    "src/IEFixes.js", 

    "src/Common.js", 

    "src/Canvas2D.css.js", 
    "src/Canvas2D.js", 
    "src/Factory.js", 
    "src/Keyboard.js", 
    "src/ImageManager.js", 
    "src/Manager.js", 
    "src/ADLVisitor.js", 
    "src/Type.js",
    "src/Types.js",
    "src/Book.js", 
    "src/Shape.js", 
    "src/Sheet.js", 
    "src/Position.js", 
    "src/Connector.js", 
    "src/ShapeFactory.js",
    "src/KickStart.js",

    "src/shapes/Line.js", 
    "src/shapes/LinePath.js", 
    "src/Alias.js", 
    "src/shapes/Rectangle.js", 
    "src/shapes/Circle.js", 
    "src/shapes/Text.js", 
    "src/shapes/Image.js", 
    "src/shapes/Arrow.js",
    "src/shapes/Circle.js",

    "src/plugins/DynamicSheet/DynamicSheet.js",
    "src/plugins/DynamicSheet/Selection.js",
    "src/plugins/DynamicSheet/Overlay.js",
    "src/plugins/DynamicSheet/Marker.js",
    "src/plugins/DynamicSheet/Box.js",
    "src/plugins/DynamicSheet/Border.js",
    "src/plugins/DynamicSheet/Position.js",
    "src/plugins/DynamicSheet/Group.js",

    "src/plugins/Widget.js",
    "src/plugins/TabbedCanvas.js", 
    "src/plugins/AutoLayout.js", 
    "src/plugins/Watermark.js",
    "src/plugins/KeyboardStatus.js",
    "src/plugins/Splash.js",
    "src/plugins/Inspector.js"
]

);