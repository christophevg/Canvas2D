Canvas2D.LinePath = Canvas2D.Shape.extend( {
  afterInit: function afterInit() {
    this.offsets = this.getOffsets();
  },

  draw: function draw(sheet, left, top) {
    sheet.strokeStyle = this.getColor();
    sheet.lineWidth   = this.getLineWidth();
    sheet.lineStyle   = this.getLineStyle();

    // determine offsets
    var width = this.getWidth();
    var height = this.getHeight();

    sheet.beginPath();
    left -= this.offsets.left;
    top  -= this.offsets.top;
    sheet.moveTo(left, top);
    this.getMoves().iterate( function(move) {
      left = left + move.left;
      top  = top  + move.top;
      sheet.lineTo(left, top);
    } );
    sheet.stroke();
    sheet.closePath();
  },
  
  getOffsets: function getOffsets() {
    var x = 0, left = 0, right = 0;
    var y  = 0, top  = 0, bottom  = 0;
    this.getMoves().iterate(function(move) {
      x += move.left;
      y  += move.top;
      if( x < left   ) { left   = x; };
      if( x > right  ) { right  = x; };
      if( y < top    ) { top    = y; };
      if( y > bottom ) { bottom = y; };
    });
    return { left: left, right: right, top: top, bottom: bottom }
  },
  
  getWidth: function getWidth() {
    return this.offsets.right - this.offsets.left;
  },
  
  getHeight: function getHeight() {
    return this.offsets.bottom - this.offsets.top;
  }
} );

Canvas2D.LinePath.MANIFEST = {
  name         : "linepath",
  properties   : {
    moves : new Canvas2D.Types.List(new Canvas2D.Types.Position()) // RelativePosition
  },
  propertyPath : [ Canvas2D.Line ],
  libraries    : [ "Canvas2D" ]
};

Canvas2D.LinePath.Defaults = {
  moves : []
};

Canvas2D.registerShape( Canvas2D.LinePath );
