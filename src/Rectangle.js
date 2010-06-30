Canvas2D.Rectangle = Canvas2D.Shape.extend( {
  draw: function draw(sheet, left, top) {
    sheet.useCrispLines = this.getUseCrispLines();
    sheet.lineWidth     = this.getLineWidth();
    sheet.strokeStyle   = this.getLineColor();
    sheet.fillStyle     = this.getFillColor();
    var width  = this.getWidth();
    var height = this.getHeight();

    if( this.getRoundCorners() ) {
      this._drawRoundCorners(sheet, left, top, width, height);
    } else {
      this._drawStraightCorners(sheet, left, top, width, height);
    }
    this._super(sheet, left, top);
  },
  
  _drawRoundCorners: function _drawRoundCorners( sheet, left, top,
                                                 width, height )
  {
    sheet.beginPath();
    sheet.moveTo(left+20,top);

    sheet.lineTo(left+width-20,top);
    sheet.arcTo(left+width+0.5,top+0.5, left+width+0.5, top+20, 20);

    sheet.lineTo(left+width,top+height-20);
    sheet.arcTo(left+width+0.5, top+height+0.5, left+width-20, top+height+0.5, 20);

    sheet.lineTo(left+20, top+height);
    sheet.arcTo(left+0.5,top+height+0.5,left+0.5,top+height-20+0.5,20);

    sheet.lineTo(left, top+20);
    sheet.arcTo( left+0.5, top+0.5, left+20.5, top+0.5, 20);

    sheet.closePath();

    sheet.fill();
    sheet.stroke();
  },

  _drawStraightCorners: function _drawStraightCorners( sheet, left, top, 
                                                       width, height ) 
  {
    sheet.fillRect( left, top, width, height );
    sheet.strokeRect( left, top, width, height );
  }
} );

Canvas2D.Rectangle.MANIFEST = {
  name         : "rectangle",
  aliasses     : [ "box" ],
  properties   : { 
    lineWidth    : new Canvas2D.Types.Size(), 
    lineColor    : new Canvas2D.Types.Color(),
    fillColor    : new Canvas2D.Types.Color(),
    roundCorners : new Canvas2D.Types.Switch()
  },
  libraries    : [ "Canvas2D" ]
};

Canvas2D.registerShape( Canvas2D.Rectangle );

Canvas2D.Rectangle.Defaults = {
  name           : "newRectangle",
  useCrispLines  : true,
  lineWidth      : 1,
  lineColor      : "rgba(0,0,0,100)",     // solid black
  fillColor      : "rgba(255,255,255,0)", // empty white ;-)
  labelPos       : "center",
  labelColor     : "black",
  width          : 50,
  height         : 50
};
