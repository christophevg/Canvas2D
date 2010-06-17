Canvas2D.Book = Class.extend( {
  init: function(element) {
    // overloaded constructor implementation allows the passing of an id
    unless( element && element.nodeType && 
      element.nodeType == Node.ELEMENT_NODE, 
      function(){
        element = document.getElementById(element);
      } 
    );

    this.HTMLElement  = element;
    this.canvas       = Canvas2D.Factory.setup(this.HTMLElement);
    this.name         = element.id;

    this.sheets       = [];
    this.currentSheet = 0;      // index of the current show sheet

    this.loadFilters  = [];

    this.setupExtensions();
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

  setupExtensions: function() {
    this.extensions = new Hash();
    Canvas2D.extensions.iterate(function(extension) {
      this.extensions.set(extension.name, extension);
    }.scope(this) );
  },

  log: function( msg ) {
    if( this.console ) { 
      this.console.value = "[" + (new Date()).toLocaleString() + "] " +
      msg + "\n" + this.console.value;
    }
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
    this.fireEvent("load");
    this.applyLoadFilters(input, 0, this.show.scope(this));
  },

  show: function showLoaded(source) {
    var parser = new ADL.Parser();
    var tree;
    this.errors = "";
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
      this.fireEvent("sourceLoaded");
      return true;
    } else {
      this.log( parser.errors );
      this.errors = parser.errors;
      this.fireEvent("sourceLoaded");
      return false;
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
      this.fireEvent( "afterPublish" );
    }

    // reshedule publish in 10ms
    this.nextPublish = this.publish.scope(this).after(10);
  },

  publishOnce : function() {
    var timer = new Timer();
    this.canvas.clear();

    if( this.getCurrentSheet() ) {
      this.fireEvent("beforeRender");
      this.getCurrentSheet().render();
      this.fireEvent("afterRender");
    }

    this.log( "Canvas2D::publish: RenderTime: " + timer.stop() + "ms" );
  },

  updateExternalSource: function updateExternalSource() {
    if( this.getCurrentSheet() ) {
      var newSource = this.getCurrentSheet().toADL();
      // this should be moved to Widget
      if( this.generated && newSource != this.generated.value ) {
        this.generated.value = newSource;
      }
      this.fireEvent( "sourceUpdated", newSource );
    }
  }

} );

// mix-in some common functionality at class level
ProtoJS.mix( 
  Canvas2D.Factory.extensions.all.EventHandling,
  Canvas2D.Book.prototype 
);

// enable plugins to register themselves with this class
Canvas2D.makePluggable( Canvas2D.Book );
