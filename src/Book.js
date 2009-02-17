Canvas2D.Book = Class.create( {
    initialize: function(element) {
	// overloaded constructor implementation allows the passing of an id
	unless( element instanceof HTMLElement, function(){
	    element = document.getElementById(element);
	} );

	this.canvas = Canvas2D.Factory.setup(element);
	this.canvas.on( "mousedown", this.passEvent.bind(this, "mousedown") );
	this.canvas.on( "mouseup",   this.passEvent.bind(this, "mouseup"  ) );
	this.canvas.on( "mousedrag", this.passEvent.bind(this, "mousedrag") );
	
	this.currentKeysDown = [];
	Event.observe(document, 'keydown', 
		      this.handleKeyDownEvent.bindAsEventListener(this));
	Event.observe(document, 'keyup', 
		      this.handleKeyUpEvent.bindAsEventListener(this));

	this.sheets = [];
	this.currentSheet = 0;      // index of the current show sheet

	// look for a console and sources for this book
	this.console = document.getElementById( element.id + "Console" );
	this.source  = document.getElementById( element.id + "Source"  );

	this.name = element.id;

	this.libraries = [];

	this.setupPlugins();
    },

    setupPlugins: function() {
	this.plugins = {};
	var book = this;
	$H(Canvas2D.Book.plugins).each(function(pair) {
	    var plugin = new (pair.value)(book);
	    book.plugins[pair.key] = plugin;
	    pair.value.exposes.each(function(func) {
		book[func] = function(arg1, arg2, arg3) { 
		    this.plugins[pair.key][func](arg1, arg2, arg3);
		};
	    } );
	} );
    },

    passEvent: function( event, data ) { this.fireEvent( event, data ); },

    handleKeyDownEvent: function( event ) {
	var key = (event || window.event).keyCode;
	this.currentKeysDown.push(key);
	this.fireEvent( "keydown", key );
    },

    handleKeyUpEvent: function( event ) {
	var key = (event || window.event).keyCode;
	this.currentKeysDown = this.currentKeysDown.without(key);
	this.fireEvent( "keyup", key );
    },

    log: function( msg ) {
	if( this.console ) { 
	    this.console.value = "[" + (new Date).toLocaleString() + "] " 
		+ msg + "\n" + this.console.value;
	}
    },

    addSheet : function( sheet ) {
	unless( sheet instanceof Canvas2D.Sheet, function() {
	    sheet = new Canvas2D.Sheet();
	} );
	sheet.setBook(this);
	this.sheets.push(sheet);
	return sheet;
    },

    getCurrentSheet: function() {
	return this.sheets[this.currentSheet];
    },

    clear : function() {
	this.sheets.clear();
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
	this.canvas.strokeStyle = "rgba(0,0,0,0.5)";
	this.canvas.rotate(Math.PI/2);
	var libraries = "";
	this.libraries.each(function(library) { 
	    libraries += " + " + library.name 
	});
	this.canvas.font = "6px Sans";
	this.canvas.strokeText( "Canvas2D" + libraries + " / Christophe VG",
				3, (this.canvas.htmlcanvas.width * -1) + 7 ); 
	this.canvas.restore();
    },
    
    addToolbar: function() {
	if( this.canvas.mouseOver ) {
	    // TODO: future feature ;-)
	}
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

    load: function(source) {    
	this.clear();

	var parser = new ADL.Parser();
	var tree;
	if( ( tree = parser.parse( source ) ) ) {
	    this.freeze();
	    tree.getRoot().accept(new Canvas2D.ADLVisitor(), this );
	    this.thaw();
	}
    },

    toADL: function() {
	var s = "";
	this.sheets.each(function(sheet) {
	    s += sheet.toADL() + "\n";
	} );
	return s;
    },

    rePublish: function() {
	this.rePublishNeeded = true;	
    },

    publish : function() {
	if( this.rePublishNeeded && !this.wait ) {
	    this.canvas.clear();

	    if( this.getCurrentSheet() ) {
		this.getCurrentSheet().render();
		this.updateSource();
	    }
	    
	    this.addWaterMark();
	    this.addToolbar();

	    this.rePublishNeeded = false;
	}
	
	// reshedule publish in 1/100 of a second
	this.nextPublish = this.publish.bind(this).delay(0.01);
    }

} );

// add-in some common functionality
Canvas2D.Book = Class.create( Canvas2D.Book, 
			      Canvas2D.Factory.extensions.EventHandling );

// add support for plugins
Canvas2D.Book.plugins = {};
//Canvas2D.Book = Class.create( Canvas2D.Book, 
//			      Canvas2D.Factory.extensions.PluginSupport );
