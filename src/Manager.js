Canvas2D.Manager = Class.create( {
    initialize : function() {
	this.plugins = [];
	this.books   = $H();
    },

    addBook : function(book) {
	unless( book instanceof Canvas2D.Book, function() { 
	    throw( "Manager::addBook: book must be instance of Canvas2D.Book" );
	} );
	this.books.set(book.name, book);
	return book;
    },

    setupBook : function(id) {
	return this.addBook(new Canvas2D.Book(id));
    },

    getBook : function(id) {
	return this.books[id];
    },
    
    startAll :function() {
	if( Canvas2D.ImageManager.isReady() ) {
	    this.plugins.each(function(plugin) { plugin.start();     } );
	    this.books  .each(function(book)   { book.value.start(); } );
	} else {
	    this.startAll.bind(this).delay(0.01);
	}
    }
} );
