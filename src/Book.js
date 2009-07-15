Canvas2D.Book = Class.extend( {
    init: function(element) {
	// overloaded constructor implementation allows the passing of an id
	unless( element && element.nodeType && 
		element.nodeType == Node.ELEMENT_NODE, 
		function(){
		    element = document.getElementById(element);
		} );

	this.canvas = Canvas2D.Factory.setup(element);

	this.sheets = [];
	this.currentSheet = 0;      // index of the current show sheet

	this.canvas.on( "mousedown", function(data) {
	    this.fireEvent("mousedown");
	    this.getCurrentSheet().handleMouseDown(data);
	}.scope(this) );

	this.canvas.on( "mouseup", function(data) {
	    this.fireEvent("mouseup");
	    this.getCurrentSheet().handleMouseUp(data);
	}.scope(this) );

	this.canvas.on( "mousedrag", function(data) {
	    this.fireEvent("mousedrag");
	    this.getCurrentSheet().handleMouseDrag(data);
	}.scope(this) );

	// look for a console and sources for this book
	this.console   = document.getElementById( element.id + "Console"   );
	this.source    = document.getElementById( element.id + "Source"    );
	this.generated = document.getElementById( element.id + "Generated" );

	this.name = element.id;

	this.setupExtensions();
	this.setupPlugins();
    },

    addSheet : function( sheet ) {
	unless( sheet instanceof Canvas2D.Sheet, function() {
	    sheet = new Canvas2D.Sheet();
	} );
	sheet.setCanvas(this.canvas);
	sheet.on( "change", this.rePublish.scope(this) );
	sheet.on( "newShape", this.log.scope(this) );
	this.sheets.push(sheet);
	return sheet;
    },

    setupExtensions: function() {
	this.extensions = new Hash();
	Canvas2D.extensions.iterate(function(extension) {
	    this.extensions.set(extension.name, extension);
	}.scope(this) );
    },

    setupPlugins: function() {
	this.plugins = {};
	$H(Canvas2D.Book.plugins).iterate(function(key, value) {
	    var plugin = new (value)(this);
	    this.plugins[key] = plugin;
	    value.exposes.iterate(function(func) {
		this[func] = function(arg1, arg2, arg3) { 
		    this.plugins[key][func](arg1, arg2, arg3);
		};
	    }.scope(this) );
	}.scope(this) );
    },

    log: function( msg ) {
	if( this.console ) { 
	    this.console.value = "[" + (new Date).toLocaleString() + "] " 
		+ msg + "\n" + this.console.value;
	}
    },

    getCurrentSheet: function() {
	return this.sheets[this.currentSheet];
    },

    clear : function() {
	// FIXME
	this.sheets.length = 0;
	// this.sheets.clear();
    },

    start : function() {
	this.stop();
	this.rePublish();
	this.publish();
    },

    stop : function() {
	if( this.nextPublish ) { window.clearTimeout( this.nextPublish ); }
    },

    freeze: function() { this.wait = true;  },
    thaw: function()   { this.wait = false; },

    addWaterMark: function() {
	this.canvas.save();
	this.canvas.fillStyle = "rgba(125,125,125,1)";
	this.canvas.textDecoration = "none";
	this.canvas.rotate(Math.PI/2);
	var extensions = "";
	this.extensions.iterate(function(key, value) { 
	    extensions += " + " + key; 
	});
	this.canvas.font = "6pt Sans-Serif";
	this.canvas.textAlign = "left";
	this.canvas.useCrispLines = false;
	this.canvas.fillText( "Canvas2D" + extensions + " / Christophe VG",
				3, (this.canvas.canvas.width * -1) + 7 ); 
	this.canvas.restore();
    },
    
    updateSource: function(source) {
	if( this.generated && this.getCurrentSheet() ) {
	    var newSource = this.getCurrentSheet().toADL();
	    if( newSource != this.generated.value ) {
		this.generated.value = newSource;
		this.fireEvent( "sourceUpdated", newSource );
	    }
	}
    },

    load: function(source) {    
	this.clear();

	var parser = new ADL.Parser();
	var tree;
	if( ( tree = parser.parse( source ) ) ) {
	    this.freeze();
	    tree.getRoot().accept(new Canvas2D.ADLVisitor(), this );
	    this.thaw();
	    this.rePublish();
	}
    },

    toADL: function() {
	var s = "";
	this.sheets.iterate(function(sheet) {
	    s += sheet.toADL() + "\n";
	} );
	return s;
    },

    rePublish: function() {
	this.rePublishNeeded = true;	
    },

    publish : function() {
	if( this.rePublishNeeded && !this.wait ) {
	    this.publishOnce();
	    this.rePublishNeeded = false;
	    this.afterPublish();
	}
	
	// reshedule publish in 10ms
	this.nextPublish = this.publish.scope(this).after(10);
    },

    afterPublish: function afterPublish() {
	this.addWaterMark();
	$H(this.plugins).iterate( function( name, plugin ) {
	    if( plugin["afterPublish"] ) { plugin.afterPublish(this); }
	}.scope(this) );
    },

    beforeRender: function beforeRender() {
	$H(this.plugins).iterate( function( name, plugin ) {
	    if( plugin["beforeRender"] ) { plugin.beforeRender(this); }
	}.scope(this) );
    },

    afterRender: function afterRender() {
	$H(this.plugins).iterate( function( plugin ) {
	    if( plugin["afterRender"] ) { plugin.afterRender(this); }
	}.scope(this) );

	this.updateSource();
    },

    publishOnce : function() {
	var timer = new Timer();
	this.canvas.clear();

	if( this.getCurrentSheet() ) {
	    this.beforeRender();
	    this.getCurrentSheet().render();
	    this.afterRender();
	}

	this.log( "Canvas2D::publish: RenderTime: " + timer.stop() + "ms" );
    }

} );
    
// mix-in some common functionality at class level
ProtoJS.mix( Canvas2D.Factory.extensions.all.EventHandling,
	     Canvas2D.Book.prototype );

// add support for plugins
Canvas2D.Book.plugins = {};
