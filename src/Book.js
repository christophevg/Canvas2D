Canvas2D.Book = Class.extend( {
  init: function init(element) {
    // overloaded constructor implementation allows the passing of an id
    unless( element && element.nodeType && 
      element.nodeType == Node.ELEMENT_NODE, 
      function(){
        element = document.getElementById(element);
      } 
    );

		if( element ) {
  	  this.HTMLElement  = element;
  	  this.name         = this.HTMLElement.id;
      this.canvas       = Canvas2D.Factory.setup(this.HTMLElement); 
		}
		
    this.sheets       = [];
    this.currentSheet = 0;      // index of the current show sheet

    this.loadFilters  = [];
  },

  add: function add( sheet ) {
    return this.addSheet(sheet);
  },

  addSheet : function addSheet( sheet ) {
    unless( sheet instanceof Canvas2D.Sheet, function() {
      sheet = new Canvas2D.Sheet( { book: this } );
    }.scope(this) );
    sheet.setCanvas(this.canvas);
    sheet.on( "change", this.rePublish.scope(this) );
    sheet.on( "newShape", this.logInfo.scope(this) );
    this.sheets.push(sheet);
    return sheet;
  },
  
  setLogHeaderGenerator : function setLogHeaderGenerator(generator) {
    this.logHeaderGenerator = generator;
    return this;
  },
  
  getLogHeader : function getLogHeader() {
    return this.logHeaderGenerator ? 
           this.logHeaderGenerator()
           : "@" + (new Date()).toLocaleString();
  },
  
  buildLogHeader : function buildLogHeader() {
    var additionalInfo = this.getLogHeader() || "";
    return "[" + this.name + additionalInfo + "] ";
  },
  
  _log: function _log( msg, suppressNativeConsole ) {
    msg = this.buildLogHeader() + msg; 
    this.logs = typeof this.logs == "undefined" ? msg : msg + "\n" + this.logs;
    this.fireEvent("logUpdated");
    if( !suppressNativeConsole && console && console.log && !Envjs) { 
      console.log( msg ); 
    }
  },
  
  logInfo : function logInfo( msg ) {
    this._log( msg, true );
  },

  logError : function logError( msg ) {
    this._log( "ERROR: " + msg, false );
  },

  logWarning : function logWarning( msg ) {
    this._log( "Warning: " + msg, false );
  },

  getCurrentSheet: function getCurrentSheet() {
    return this.sheets[this.currentSheet];
  },

  clear : function clear() {
    this.sheets.length = 0;
  },
  
  renderImmediate : function renderImmediate() {
    this.renderMode = "immediate";
    return this;
  },

  start : function start() {
    if( this.renderMode == "immediate" ) { return this; }
    this.stop();
    this.rePublish();
    this.publish();
    return this;
  },

  stop : function stop() {
    if( this.renderMode == "immediate" ) { return this; }
    if( this.nextPublish ) { window.clearTimeout( this.nextPublish ); }
    return this;
  },

  freeze: function freeze() { this.wait = true;  return this; },
  thaw: function thaw()   { this.wait = false; return this; },

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
    // FIXME: &lt; is needed in HTML, but we don't handle it well
    input = input.replace(/&lt;/g, "<");
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
      tree.getRoot().accept(visitor, this);
      this.thaw();
      this.rePublish();
      if( visitor.encounteredErrors() ) {
        this.errors = "ADLVisitor reported errors:";
        visitor.errors.iterate( function(error) {
          this.logError(error);
          this.errors += "\n   - " + error;
        }.scope(this));
      }
      success = true;
    } else {
      this.logError( parser.errors );
      this.errors = parser.errors;
    }
    
    this.fireEvent( "sourceLoaded", this.toADL() );

    return success;
  },

  toADL: function toADL() {
    var s = "";
    this.sheets.iterate(function(sheet) {
      s += sheet.asConstruct().toString() + "\n";
    } );
    return s;
  },

  rePublish: function rePublish() {
    if( this.renderMode == "immediate" ) { return this.publishOnce(); }
    this.rePublishNeeded = true;
  },

  publish : function publish() {
    if( this.renderMode == "immediate" ) { return this.publishOnce(); }

    if( this.rePublishNeeded && !this.wait ) {
      this.publishOnce();
      this.rePublishNeeded = false;
    }

    // reshedule publish in 10ms
    this.nextPublish = this.publish.scope(this).after(10);
  },

  publishOnce : function publishOnce() {
    var timer = new Timer();
    if( this.canvas ) { this.canvas.clear(); }

    if( this.getCurrentSheet() ) {
      this.fireEvent("beforeRender");
      this.getCurrentSheet().render();
      this.fireEvent("afterRender");
    }

    if( this.renderMode != "immediate" ) {
      this.logInfo( "RenderTime: " + timer.stop() + "ms" );
    }
    this.fireEvent( "afterPublish" );
  }
} );

// mix-in some common functionality at class level
ProtoJS.mix( 
  Canvas2D.Factory.extensions.all.EventHandling,
  Canvas2D.Book.prototype 
);

// enable plugins to register themselves with this class
Canvas2D.makePluggable( Canvas2D.Book );
