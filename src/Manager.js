Canvas2D.Manager = Class.create( {
    initialize : function() {
	this.plugins = [];
	this.books   = $H();
    },

    setupBook : function(id) {
	return this.addBook(new Canvas2D.Book(id));
    },

    addBook : function(book) {
	unless( book instanceof Canvas2D.Book, function() { 
	    throw( "Manager::addBook: book must be instance of Canvas2D.Book" );
	} );
	this.books.set(book.name, book);
	return book;
    },

    getBook : function(id) {
	return this.books.get(id);
    },
    
    startAll :function() {
	if( Canvas2D.ImageManager.isReady() ) {
	    this.plugins.each(function(plugin)      { plugin.start(); } );
	    this.books.values().each(function(book) { book.start();   } );
	} else {
	    this.startAll.bind(this).delay(0.01);
	}
    }
} );
