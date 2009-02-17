Canvas2D.Manager = Class.create( {
    initialize : function() {
	this.plugins = [];
	this.books   = [];
    },

    addBook : function(book) {
	unless( book instanceof Canvas2D.Book, function() { 
	    throw( "Manager::addBook: book must be instance of Canvas2D.Book" );
	} );
	this.books.push(book);
	return book;
    },

    setupBook : function(id) {
	return this.addBook(new Canvas2D.Book(id));
    },
    
    startAll :function() {
	if( Canvas2D.ImageManager.isReady() ) {
	    this.plugins.each(function(plugin) { plugin.start(); } );
	    this.books  .each(function(book)   { book  .start(); } );
	} else {
	    this.startAll.bind(this).delay(0.01);
	}
    }
} );
