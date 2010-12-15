Canvas2D.Widget = Class.extend( {
  init: function init(book) {
    this.book = book;
    this.setupComponents();
  },
  
  setupComponents: function setupComponents() {
    this.book.logInfo( "Setup Widget Components..." );
    this.setupConsole();
    this.setupSource();
    this.setupGenerated();
    this.setupAbout();
  },

  _getElement: function _getElement(id, type) {
    var element = document.getElementById( type + "_for_" + id );
    if( ! element ) {
      var suffix= type.substr(0, 1).toUpperCase() + type.substr(1);
      element = document.getElementById( id + suffix );
      if( element ) {
        this.book.logWarning( "Deprecated widget pattern: " + id + suffix );
      }
    }
    return element;
  },

  setupConsole: function setupConsole() {
    this.console = this._getElement(this.book.name, "console" );
    if( ! this.console ) { return; }
    this.book.on( "logUpdated", function() {
      this.console.value = this.book.logs;
    }.scope(this) );
    this.book.logInfo( "  Console set up for " + this.book.getName() );
  },

  setupSource: function setupSource() {
    this.source = this._getElement(this.book.name, "source" );
    if( this.source ) {
      this.book.load(this.source.innerHTML);
    }
    this.book.logInfo( "  Source set up for " + this.book.getName() );
  },

  setupGenerated: function setupGenerated() {
    this.generated = this._getElement(this.book.name, "generated" );
    if( ! this.generated ) { return; }
    this.book.on( "afterRender", function() {
      var newSource = this.book.toADL();
      if( this.generated.value != newSource ) {
        this.generated.value = newSource;
      }
    }.scope(this) );
    this.book.logInfo("  Generated Source set up for " + this.book.getName());
  },

  setupAbout: function setupAbout() {
    this.about = this._getElement(this.book.name, "about" );
    if( ! this.about ) { return; }
        var libraries = "";
    Canvas2D.extensions.iterate(function(library) {
      libraries += "\n<hr>\n";
      libraries += "<b>Library: " +
      library.name + " " + library.version + "</b> " + 
      "by " + library.author + "<br>" +
      library.info;
    });
    this.about.innerHTML = '<span style="font: 9pt Verdana, sans-serif;">' +
      '<b>Canvas2D ' + Canvas2D.version  + 
      '</b><br>Copyright &copy 2009-2010, ' +
      '<a href="http://christophe.vg" target="_blank">Christophe VG</a>.'+ 
      'Visit <a href="http://canvas2d.org" ' +
      'target="_blank">http://canvas2d.org</a> ' +
      'for more info. Licensed under the BSD License.' + 
      libraries + '</span>';
    this.book.logInfo("  About set up for " + this.book.getName());
  }
} );

Canvas2D.Widget.getInstance = function getInstance(book) {
  return new Canvas2D.Widget(book);
};

Canvas2D.Book.addPlugin( "Widget", Canvas2D.Widget );
