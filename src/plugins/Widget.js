Canvas2D.Widget = {};

Canvas2D.Widget.setupComponents = function setupComponents() {
  // TODO: this must be replaced by the new Widget code (see UmlCanvas)
  // look for a console and sources for this book
  var id = this.HTMLElement.id;
  this.console   = document.getElementById( id + "Console"   );
  this.source    = document.getElementById( id + "Source"    );
  this.generated = document.getElementById( id + "Generated" );
};

Class.extendMethod( Canvas2D.Book, "init", Canvas2D.Widget.setupComponents );
