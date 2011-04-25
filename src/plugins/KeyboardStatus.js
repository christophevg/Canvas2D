Canvas2D.KeyboardStatus = Class.extend( {
  init: function init(book) {
    this.book = book;
    this.book.on( "afterPublish", this.afterPublish.scope(this) );
    Canvas2D.Keyboard.on( "keydown", this.book.rePublish.scope(this.book) );
    Canvas2D.Keyboard.on( "keyup",   this.book.rePublish.scope(this.book) );
  },

  getKeys: function getKeys() {
    var kb = Canvas2D.Keyboard;
    var keys = [];
    if( kb.keyDown(16) )                   { keys.push( "shift" ); }
    if( kb.keyDown(91) || kb.keyDown(93) ) { keys.push( "cmd"   ); }
    if( kb.keyDown(18) )                   { keys.push( "alt"   ); }
    if( kb.keyDown(17) || kb.keyDown(19) ) { keys.push( "ctrl"  ); }
    return keys.join(" ");
  },

  afterPublish: function afterPublish() {
    this.book.canvas.save();
    this.book.canvas.fillStyle = "rgba(125,125,125,1)";
    this.book.canvas.textDecoration = "none";
    this.book.canvas.font = "7pt Sans-Serif";
    this.book.canvas.textAlign = "right";
    this.book.canvas.useCrispLines = false;
    this.book.canvas.lineStyle = "solid";
    this.book.canvas.fillText( this.getKeys(), 
                               this.book.canvas.canvas.width - 20, 10 ); 
    this.book.canvas.restore();
  },

  getName: function getName() { return "KeyboardStatus"; }
} );

// one KeyboardStatus for all Canvas2D instances is enough
Canvas2D.KeyboardStatus.getInstance = function getInstance(book) {
  if( !Canvas2D.KeyboardStatus.__instance__ ) {
    Canvas2D.KeyboardStatus.__instance__ = new Canvas2D.KeyboardStatus(book);
  }
  return Canvas2D.KeyboardStatus.__instance__;
};

Canvas2D.Book.addPlugin( "KeyboardStatus", Canvas2D.KeyboardStatus );
