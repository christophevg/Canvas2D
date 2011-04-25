Canvas2D.Manager = Class.extend( {
  init : function init() {
    //this.plugins = [];
    this.books   = $H();
  },

  setupBook : function setupBook(id) {
    return this.addBook(new Canvas2D.Book(id));
  },

  addBook : function addBook(book) {
    unless( book instanceof Canvas2D.Book, function() { 
      throw( "Manager::addBook: book must be instance of Canvas2D.Book" );
    } );
    this.books.set(book.name, book);
    return book;
  },

  getBook : function getBook(id) {
    return this.books.get(id);
  },

  startAll :function startAll() {
    if( Canvas2D.ImageManager.isReady() ) {
      //this.plugins.iterate(function(plugin)      { plugin.start(); } );
      this.books.values().iterate(function(book) { book.start();   } );
    } else {
      this.startAll.scope(this).after(10);
    }
  }
} );
