// namespace for holding all Canvas2D related classes and functions
var Canvas2D = {};

Canvas2D.canvases = {};

Canvas2D.getCanvas = function(id) { return Canvas2D.canvases[id]; };

// technical wrapper class for the HTML5 Canvas element
Canvas2D.Canvas = Class.create( {
    initialize: function(id) {
	this.tabbed  = false;       // tabbed interface

	this.wait = false;          // indicator not to draw

	this.sheets = [];           // list of sheets on this Canvas
	this.currentSheet = 0;      // index of the current show sheet

	this.eventHandlers = {};    // map of registered eventHandlers

	this.plugins = [];          // list of registered plugins

	this.currentX    = 0;       // current drawing position on X-axis
	this.currentY    = 0;       // current drawing position on Y-axis
	this.lineWidth   = 1;       // current drawing lineWidth
	this.lineStyle   = "solid"; // current drawing lineStyle [solid|dashed]
	this.strokeStyle = "black"; // current drawing strokeStyle
	this.fillStyle   = "black"; // current drawing fillStyle

	// setup HTML5 canvas
	this.htmlcanvas = document.getElementById(id); // the Canvas Element 
	this.wireCanvas();

	// look for a console and sources for this canvas
	this.console = document.getElementById( id+"Console" );
	this.source  = document.getElementById( id+"Source" );

	// register a global reference
	Canvas2D.canvases[id] = this;
	
	this.mouseOver = false;        // indicator if mouse is over the canvas
	this.mousePos  = { x:0, y:0 }; // current mouse position
    },

    clear: function() {
	this.sheets = [];
    },

    wireCanvas: function() {
	if( this.htmlcanvas ) {
	    this.canvas = this.htmlcanvas.getContext('2d');
	    if( this.canvas ) {
		// attach eventhandlers for mouse events
		Event.observe(this.htmlcanvas, 'mousedown', 
			      this.handleMouseDown.bindAsEventListener(this));
		Event.observe(this.htmlcanvas, 'mouseup', 
			      this.handleMouseUp.bindAsEventListener(this));
		Event.observe(document, 'mousemove', 
			      this.handleMouseMove.bindAsEventListener(this));
		// add textfunctions
		this.enableTextRendering();
	    }
	    this.render();
	}
    },

    makeTab: function(name, height, content) {
	var tab = document.createElement("div");
	tab.className = "tabbertab";
	tab.style.height = ( 4 + parseInt(height) ) + "px";
	var head = document.createElement("h2");
	var txt = document.createTextNode(name);
	head.appendChild(txt);
	tab.appendChild(head);
	tab.appendChild(content);
	return tab;
    },

    registerPlugin: function( plugin ) {
	this.plugins.push( plugin );
    },

    getAboutTab: function(width,height) {
	var about = document.createElement("div");
	about.className = "Canvas2D-about";
	about.style.height = height + "px";
	about.style.width = (parseInt(width)-4)  + "px";

	var plugins = "";
	if( this.plugins.length > 0 ) {
	    this.plugins.each(function(plugin) {
		plugins += "\n<hr>\n";
		plugins += "<b>Plugin: " + plugin.name + "</b> " + 
		    "by " + plugin.author + "<br>" +
		    plugin.info;
	    });
	}

	about.innerHTML = '<span class="Canvas2D-about-text">' +
	    '<b>Canvas2D</b><br>Copyright &copy 2009, ' +
	    '<a href="http://christophe.vg" target="_blank">Christophe VG</a>'+ 
	    ' & <a href="http://thesoftwarefactory.be" ' +
	    'target="_blank">The Software Factory</a><br>' + 
	    'Visit <a href="http://thesoftwarefactory.be/wiki/Canvas2D" ' +
	    'target="_blank">http://thesoftwarefactory.be/wiki/Canvas2D</a> ' +
	    'for more info. Licensed under the ' +
	    '<a href="http://thesoftwarefactory.be/wiki/BSD_License" ' + 
	    'target="_blank">BSD License</a>.' + plugins + '</span>';
	return this.makeTab("About", height, about );
    },

    getConsoleTab: function(width, height) {
	this.console = document.createElement("textarea");
	this.console.className = "Canvas2D-console";
	this.console.style.height = height + "px";
	this.console.style.width  = ( parseInt(width) - 4 )  + "px";
	return this.makeTab("Console", height, this.console );
    },

    getSourceTab: function(width, height) {
	this.source = document.createElement("textarea");
	this.source.className = "Canvas2D-source";
	this.source.style.height = height + "px";
	this.source.style.width  = ( parseInt(width) - 4 )  + "px";
	return this.makeTab("Source", height, this.source );
    },

    getCurrentSheet: function() {
	return this.sheets[this.currentSheet];
    },

    updateSource: function(source) {
	if( this.source && this.getCurrentSheet() ) {
	    var newSource = this.getCurrentSheet().toADL();
	    if( newSource != this.source.value ) {
		this.source.value = newSource;
		this.fireEvent( "sourceUpdated", newSource );
	    }
	}
    },

    // TODO: this is ugly, try to find a better solution
    makeTabbed: function(tabs) {
	if( this.tabbed ) { return; }
	var source = this.htmlcanvas;
	var tabber = document.createElement("div");
	tabber.className="tabber";
	tabber.style.width = (parseInt(source.width) + 17) + "px";
	tabber.style.height = (parseInt(source.height) + 37) + "px";
	var tab1 = document.createElement("div");
	tab1.className = "tabbertab";
	var h1 = document.createElement("h2");
	var t1 = document.createTextNode("Diagram");
	h1.appendChild(t1);
	tab1.appendChild(h1);
	var newCanvas = document.createElement("canvas");
	newCanvas.id = source.id;
	newCanvas.className = source.className;
	newCanvas.width = source.width;
	newCanvas.height = source.height;
	tab1.appendChild(newCanvas);
	tabber.appendChild(tab1);

	if( tabs ) {
	    if( tabs.indexOf("console") > -1 ) {
		tabber.appendChild(this.getConsoleTab(source.width, 
						      source.height));
	    }
	    if( tabs.indexOf("source") > -1 ) {
		tabber.appendChild(this.getSourceTab(source.width,
						     source.height));
	    }

	    if( tabs.indexOf("about") > -1 ) { 
		tabber.appendChild(this.getAboutTab(source.width,
						    source.height));
	    }
	}

	source.parentNode.replaceChild(tabber, source);
	// apply excanvas to new element
	try {
	    this.htmlcanvas = G_vmlCanvasManager.initElement(newCanvas);
	} catch(err) {
	    this.htmlcanvas = newCanvas;	   
	}
	tabberAutomatic(); // activate Tabber
	this.wireCanvas(); // rewire Canvas2D events,...
	this.render();     // force rerender

	this.tabbed = true;
    },

    on: function( event, handler ) {
	this.eventHandlers[event] = handler;
    },

    fireEvent: function( event, data ) {
	if( this.eventHandlers[event] ) {
	    this.eventHandlers[event](data);
	}
    },

    log: function( msg ) {
	if( this.console ) {
	    this.console.value = msg + "\n" + this.console.value;
	}
    },

    getLeft: function() {
	var elem = this.htmlcanvas;
	var left = 0;
	while( elem != null ) {
	    left += elem.offsetLeft;
	    elem = elem.offsetParent;
	}
	return left;
    },

    getTop: function() {
	var elem = this.htmlcanvas;
	var top = 0;
	while( elem != null ) {
	    top += elem.offsetTop;
	    elem = elem.offsetParent;
	}
	return top;
    },

    getXY: function(event) {
	if( event == null ) { event = window.event; }
	if( event == null ) { return null;          }
	if( event.pageX || event.pageY ) {
            return { x: event.pageX - this.getLeft(), 
		     y: event.pageY - this.getTop()  };
	}
	return null;
    },

    handleMouseDown: function(event) {
	this.mousepressed = true;
	var pos = this.getXY(event);
	this.fireEvent( "mousedown", pos );
	this.mousePos = pos;
	this.render();
    },

    handleMouseUp: function(event) {
	this.mousepressed = false;
	var pos = this.getXY(event);
	this.fireEvent( "mouseup", pos );
	this.mousePos = pos;
	this.render();
    },

    handleMouseMove: function(event) {
	if( this.mousepressed ) {
	    this.handleMouseDrag(event);
	}
	var pos = this.getXY(event);
	if( pos ) {
	    this.mouseOver = 
		( pos.x >= 0 && pos.x <= this.htmlcanvas.width )
		&&  
		( pos.y >= 0 && pos.y <= this.htmlcanvas.height );
	}
    },

    handleMouseDrag: function(event) {
	var pos = this.getXY(event);
	this.fireEvent( "mousedrag", { x: pos.x, 
				       y: pos.y, 
				       dx: pos.x - this.mousePos.x,
				       dy: pos.y - this.mousePos.y } );
	this.mousePos = pos;
	this.render();
    },

    clearRect: function(x, y, w, h ) {
	this.canvas.clearRect( x, y, w, h );
    },

    fillRect: function(x, y, w, h ) {
	this.canvas.fillStyle = this.fillStyle;
	this.canvas.fillRect( x, y, w, h );
    },

    strokeRect: function(x, y, w, h ) {
	this.canvas.strokeStyle = this.strokeStyle;
	this.canvas.strokeRect( x, y, w, h );
    },

    beginPath: function() {
	this.canvas.beginPath();
    },

    closePath: function() {
	this.canvas.closePath();
    },

    stroke: function() {
	this.canvas.strokeStyle = this.strokeStyle;
	this.canvas.lineWidth = this.lineWidth;
	this.canvas.stroke();
    },

    fill: function() {
	this.canvas.fillStyle = this.fillStyle;
	this.canvas.fill();
    },

    moveTo: function(x,y) {
	this.canvas.moveTo( x, y );
	this.currentX = x;
	this.currentY = y;
    },

    lineTo: function(x,y) {
	if( this.lineStyle == "dashed" ) {
	    this._drawLine( this.currentX, this.currentY, x, y );
	} else {
	    this.canvas.lineTo( x, y );
	}
	this.currentX = x;
	this.currentY = y;
    },

    measureText: function(font, size, text) {
	return this.canvas.measureText( font, size, text );
    },

    drawTextCenter: function(font, size, left, top, text) {
	this.canvas.strokeStyle = this.strokeStyle;
	this.canvas.drawTextCenter(font, size, left, top, text);
    },

    drawText: function(font, size, left, top, text) {
	this.canvas.strokeStyle = this.strokeStyle;
	this.canvas.drawText(font, size, left, top, text);
    },

    drawImage: function(img, left, top) {
	if( !img.complete ) { return; }
	this.canvas.drawImage(img, left, top);
    },

    rotate: function(ang) {
	this.canvas.rotate(ang);
    },

    arc: function(left, top, radius, startAngle, endAngle, anticlockwise ) {
	this.canvas.arc(left, top, radius, 
			startAngle, endAngle, anticlockwise );
    },

    _plotPixel: function( x, y, c ) {
	with( this.canvas ) {
	    var oldStyle = strokeStyle;
	    beginPath();
	    strokeStyle = c;
	    moveTo(x,y);
	    lineTo(x+1,y+1);
	    stroke();
	    closePath();
	    strokeStyle = oldStyle;
	}
    },

    _drawLine: function(x1, y1, x2, y2 ) {
	x1 = Math.floor(x1);
	x2 = Math.floor(x2);
	y1 = Math.floor(y1-1);
	y2 = Math.floor(y2-1);
	// to make sure other strokes are stroked:
	this.canvas.stroke();

	var c = this.strokeStyle;
	var style = this.lineStyle;

	var steep = Math.abs(y2 - y1) > Math.abs(x2 - x1);
	if (steep) {
            t = y1;            y1 = x1;            x1 = t;
            t = y2;            y2 = x2;            x2 = t;
	}
	var deltaX = Math.abs(x2 - x1);
	var deltaY = Math.abs(y2 - y1);
	var error = 0;
	var deltaErr = deltaY;
	var xStep;
	var yStep;
	var x = x1;
	var y = y1;
	if(x1 < x2) {  xStep = 1; } else { xStep = -1; }
	if(y1 < y2) {  yStep = 1; } else { yStep = -1;	}
	if( steep ) { this._plotPixel(y, x, c); } 
	else        { this._plotPixel(x, y, c); }
	var dot = 0;
	while( x != x2 ) {
            x = x + xStep;
            error = error + deltaErr;
            if( 2 * error >= deltaX ) {
		y = y + yStep;
		error = error - deltaX;
            }
	    var color = ( style != "dashed" || ++dot % 15 ) < 10 ? c : "white";
            if(steep) { this._plotPixel(y, x, color); } 
	    else      { this._plotPixel(x, y, color); }
	}
    },
    
    freeze: function() {
	this.wait = true;
    },

    thaw: function() {
	this.wait = false;
	this.render();
    },

    addWaterMark: function() {
	this.canvas.save();
	this.strokeStyle = "rgba(0,0,0,0.50)";
	this.rotate(Math.PI/2);
	var plugins = "";
	this.plugins.each(function(plugin) { plugins += " + " + plugin.name });
	this.drawText( "Sans", 6, 3, (this.htmlcanvas.width * -1) + 7, 
		       "Canvas2D" + plugins + " / Christophe VG" ); 
	this.canvas.restore();
    },

    addToolbar: function() {
	if( this.mouseOver ) {
	    // TODO: future feature ;-)
	}
    },

    render: function() {
	if( this.wait || !this.canvas ) { return; }

	this.canvas.clearRect( 0, 0, 
			       this.htmlcanvas.width, 
			       this.htmlcanvas.height );

	if( this.getCurrentSheet() ) {
	    this.getCurrentSheet().render();
	    this.updateSource();
	}

	this.addWaterMark();
	this.addToolbar();
    },

    toADL: function() {
	var s = "";
	this.sheets.each(function(sheet) {
	    s += sheet.toADL() + "\n";
	} );
	return s;
    },

    addSheet: function(sheet) {
	this.sheets.push(sheet);
	sheet.setCanvas(this);
	return sheet;
    },

    add: function(sheet) {
	return this.addSheet(sheet);
    },

	enableTextRendering: function() {
		if (!this.canvas.fillText && this.canvas.mozDrawText) {
			this.canvas.fillText = function(text, x, y) {
				this.drawText(text, x, y);
			}
		}
		if (!this.canvas.strokeText && this.canvas.mozDrawText) {
			this.canvas.strokeText = function(text, x, y) {
				this.drawText(text, x, y);
			}
		}
		if (!this.canvas.drawText && this.canvas.mozDrawText) {
			this.canvas.drawText = function(font,size,x,y,text) {
				this.save();
				this.translate(x, y);
				this.font = size + "pt" + " " + font;
				this.mozDrawText(text);
				this.restore();
			}
		}
			
		if (!this.canvas.measureText && this.canvas.mozMeasureText) {
			this.canvas.measureText = function(text) {
				return this.mozMeasureText(text);
			}
		}
		
		CanvasTextFunctions.enable(this.canvas);
	},

    load: function(source) {    
	this.clear();
		
	var parser = new ADL.Parser();
	var tree;
	if( ( tree = parser.parse( source ) ) ) {
	    this.freeze();
	    tree.getRoot().accept(new Canvas2D.ADLVisitor(), this );
	    this.thaw();
	}
    }

} );
