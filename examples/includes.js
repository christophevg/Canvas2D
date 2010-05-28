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
    "../src/Connector.js", 
    "../src/Line.js", 
    "../src/LinePath.js", 
    "../src/Alias.js", 

    "../src/CompositeShape.js", 
    "../src/Compositor.Stack.js", 
    "../src/Rectangle.js", 
    "../src/Text.js", 
    "../src/Image.js", 
    "../src/Arrow.js",

    "../src/plugins/TabbedCanvas.js", 
    "../src/plugins/AutoLayout.js", 
    "../src/plugins/Watermark.js", 

    "../src/KickStart.js", 
    
    "../src/Defaults.js" 
];

function addScript(url) {
  document.writeln( "<script type=\"text/javascript\" src=\"" + url + "\"></script>" );
}

function loadScripts() {
  for( var i=0; i<scripts.length; i++ ) {
    addScript(scripts[i]);
  }
}

loadScripts();
