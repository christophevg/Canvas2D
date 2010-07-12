Canvas2D.Book = Class.extend( {
  init: function(element) {
    // overloaded constructor implementation allows the passing of an id
    unless( element && element.nodeType && 
      element.nodeType == Node.ELEMENT_NODE, 
      function(){
        element = document.getElementById(element);
      } 
    );

		if( element ) {
    	this.HTMLElement  = element;
    	this.canvas       = Canvas2D.Factory.setup(this.HTMLElement);
    	this.name         = element.id;
		}
		
    this.sheets       = [];
    this.currentSheet = 0;      // index of the current show sheet

    this.loadFilters  = [];
  },

  add: function( sheet ) {
    return this.addSheet(sheet);
  },

  addSheet : function( sheet ) {
    unless( sheet instanceof Canvas2D.Sheet, function() {
      sheet = new Canvas2D.Sheet( { book: this } );
    }.scope(this) );
    sheet.setCanvas(this.canvas);
    sheet.on( "change", this.rePublish.scope(this) );
    sheet.on( "newShape", this.log.scope(this) );
    this.sheets.push(sheet);
    return sheet;
  },

  log: function( msg ) {
    this.logs = "[" + (new Date()).toLocaleString() + "] " + 
                msg + "\n" + this.logs;
    this.fireEvent("logUpdated");
  },

  getCurrentSheet: function() {
    return this.sheets[this.currentSheet];
  },

  clear : function() {
    this.sheets.length = 0;
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

  addLoadFilter: function addLoadFilter(filter) {
    this.loadFilters.push(filter);
  },

  applyLoadFilters: function applyLoadFilters(input, filterIndex, onReadyHandler) {
    if( filterIndex < this.loadFilters.length ) {
      this.loadFilters[filterIndex].apply( input, function(result) {
        this.applyLoadFilters(result, filterIndex+1, onReadyHandler);
      }.scope(this) );
    } else {
      onReadyHandler(input);
    }
  },

  load: function load(input) {
    if( ! input || input.trim() == "" ) { return; }
    this.fireEvent("load");
    this.applyLoadFilters(input, 0, this.show.scope(this));
  },

  show: function show(source) {
    var parser = new ADL.Parser();
    var tree;
    this.errors = "";
    var success = false;
    
    if( ( tree = parser.parse( source ) ) ) {
      this.clear();
      this.freeze();
      var visitor = new Canvas2D.ADLVisitor();
      tree.getRoot().accept(visitor, this );
      this.thaw();
      this.rePublish();
      if( visitor.errors.length > 0 ) {
        this.errors = "ADLVisitor reported errors:";
        visitor.errors.iterate( function(error) {
          this.log(error);
          this.errors += "\n   - " + error;
        }.scope(this));
      }
      success = true;
    } else {
      this.log( parser.errors );
      this.errors = parser.errors;
    }
    
    if( this.getCurrentSheet() ) {
      var newSource = this.toADL();
      this.fireEvent( "sourceLoaded", newSource );
    }
    return success;
  },

  toADL: function() {
    var s = "";
    this.sheets.iterate(function(sheet) {
      s += sheet.asConstruct().toString() + "\n";
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
      this.fireEvent( "afterPublish" );
    }

    // reshedule publish in 10ms
    this.nextPublish = this.publish.scope(this).after(10);
  },

  publishOnce : function() {
    var timer = new Timer();
    if( this.canvas ) { this.canvas.clear(); }

    if( this.getCurrentSheet() ) {
      this.fireEvent("beforeRender");
      this.getCurrentSheet().render();
      this.fireEvent("afterRender");
    }

    this.log( "Canvas2D::publish: RenderTime: " + timer.stop() + "ms" );
  }
} );

// mix-in some common functionality at class level
ProtoJS.mix( 
  Canvas2D.Factory.extensions.all.EventHandling,
  Canvas2D.Book.prototype 
);

// enable plugins to register themselves with this class
Canvas2D.makePluggable( Canvas2D.Book );
