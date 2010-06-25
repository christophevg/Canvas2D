/**
 * Watermark Plugin adds a watermark to every diagram. This watermark is
 * configurable on a Book by Book basis.
 * @author xtof
 */
Canvas2D.Watermark = Class.extend( {
  /**
   * Registers a watermark drawing function at afterPublish of a Book.
   * @param Book to which the Watermark will be added
   */
  addBook: function addBook(book) {
    book.on( "afterPublish", this.drawWatermark.scope(book) );
  },

  /**
   * Draws a watermark on a book, which it is in scope of.
   * @private
   */
  drawWatermark: function drawWatermark() {
    this.canvas.save();
    this.canvas.rotate(Math.PI/2);
    this.canvas.fillStyle     = "rgb(125,125,125)";
    this.canvas.font          = "6pt Sans-Serif";
    this.canvas.useCrispLines = false;
    var labels = $H(Canvas2D.Watermark.label);
    var label = labels.get( 
      labels.hasKey(this.getName()) ? this.getName() : "_default" 
    );

    this.canvas.fillText( label, 3, (this.getWidth() * -1) + 7 +
      ( ProtoJS.Browser.IE ? 4 : 0 ) ); // if styleborder
    this.canvas.restore();
  }
} );

// label hash allows per book configuration of Watermark
Canvas2D.Watermark.label = { _default: "Canvas2D / Christophe VG" };

// one Watermarker for all Canvas2D instances is enough
Canvas2D.Watermark.getInstance = function getInstance(book) {
  if( !Canvas2D.Watermark.__instance__ ) {
    Canvas2D.Watermark.__instance__ = new Canvas2D.Watermark();
  }
  Canvas2D.Watermark.__instance__.addBook(book);
  return Canvas2D.Watermark.__instance__;
};

Canvas2D.Book.addPlugin( "Watermark", Canvas2D.Watermark );
