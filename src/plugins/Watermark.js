Canvas2D.Book.plugins.Watermark = Class.extend( {
    afterPublish: function afterPublish(book) {
      book.canvas.save();
      book.canvas.fillStyle = "rgba(125,125,125,1)";
      book.canvas.textDecoration = "none";
      book.canvas.rotate(Math.PI/2);
      var extensions = "";
      book.extensions.iterate(function(key, value) { 
        extensions += " + " + key; 
      });
      book.canvas.font = "6pt Sans-Serif";
      book.canvas.textAlign = "left";
      book.canvas.useCrispLines = false;
      book.canvas.lineStyle = "solid";
      book.canvas.fillText( "Canvas2D" + extensions + " / Christophe VG",
      3, (book.canvas.canvas.width * -1) + 7 +
      ( ProtoJS.Browser.IE ? 4 : 0 ) ); // if styleborder
      book.canvas.restore();
    }
} );
