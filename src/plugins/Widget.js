Canvas2D.Widget = Class.extend( {
  init: function init(book) {
    this.book = book;
		// TODO: do this better ;-)
    if( this.book.HTMLElement ) { this.id = this.book.HTMLElement.id; }
    this.setupComponents();
  },
  
  setupComponents: function setupComponents() {
    this.setupConsole();
    this.setupSource();
    this.setupGenerated();
  },

  _getElement: function _getElement(id, type) {
    var element = document.getElementById( type + "_for_" + id );
    if( ! element ) {
      var suffix= type.substr(0, 1).toUpperCase() + type.substr(1);
      element = document.getElementById( id + suffix );
      if( element ) {
        console.log( "WARNING: deprecated widget pattern: " + id + suffix );
      }
    }
    return element;
  },

  setupConsole: function setupConsole() {
    this.console = this._getElement(this.id, "console" );
    if( ! this.console ) { return; }
    this.book.on( "logUpdated", function() {
      this.console.value = this.book.logs;
    }.scope(this) );
  },

  setupSource: function setupSource() {
    this.source = this._getElement(this.id, "source" );
    if( this.source ) {
      this.book.show(this.source);
    }
  },

  setupGenerated: function setupGenerated() {
    this.generated = this._getElement(this.id, "generated" );
    if( ! this.generated ) { return; }
    this.book.on( "sourceLoaded", function(newSource) {
      if( this.generated.value != newSource ) {
        this.generated.value = newSource;
      }
    }.scope(this) );
  },
} );

Canvas2D.Widget.getInstance = function getInstance(book) {
  return new Canvas2D.Widget(book);
};

Canvas2D.Book.addPlugin( "Widget", Canvas2D.Widget );
