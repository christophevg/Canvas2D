Canvas2D.Watermark = Class.extend( {
  init: function init(book) {
    this.book = book;
    this.book.on( "afterPublish", this.afterPublish.scope(this) );
  },

  afterPublish: function afterPublish() {
    this.book.canvas.save();
    this.book.canvas.fillStyle = "rgba(125,125,125,1)";
    this.book.canvas.textDecoration = "none";
    this.book.canvas.rotate(Math.PI/2);
    var extensions = "";
    this.book.extensions.iterate(function(key, value) { 
      extensions += " + " + key; 
    });
    this.book.canvas.font = "6pt Sans-Serif";
    this.book.canvas.textAlign = "left";
    this.book.canvas.useCrispLines = false;
    this.book.canvas.lineStyle = "solid";
    this.book.canvas.fillText( "Canvas2D" + extensions + " / Christophe VG",
    3, (this.book.canvas.canvas.width * -1) + 7 +
    ( ProtoJS.Browser.IE ? 4 : 0 ) ); // if styleborder
    this.book.canvas.restore();
  },

  getName: function getName() { return "WaterMark"; }
} );

// one Watermarker for all Canvas2D instances is enough
Canvas2D.Watermark.getInstance = function getInstance(book) {
  if( !Canvas2D.Watermark.__instance__ ) {
    Canvas2D.Watermark.__instance__ = new Canvas2D.Watermark(book);
  }
  return Canvas2D.Watermark.__instance__;
};

Canvas2D.Book.addPlugin( "Watermark", Canvas2D.Watermark );
