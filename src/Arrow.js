Canvas2D.Arrow = Canvas2D.Rectangle.extend( {
  draw: function(sheet, left, top) {
    // rect
    sheet.useCrispLines = this.getUseCrispLines();
    sheet.lineWidth     = this.getLineWidth();
    sheet.strokeStyle   = this.getLineColor();
    sheet.fillStyle     = this.getFillColor();

    sheet.fillRect( left, 
      top, 
      this.getWidth() - this.getArrowHeadWidth(), 
      this.getHeight() 
    );
    sheet.strokeRect( left, 
      top, 
      this.getWidth() - this.getArrowHeadWidth(), 
      this.getHeight() 
    );

    // arrow head
    sheet.beginPath();

    sheet.moveTo(left + this.getWidth() - this.getArrowHeadWidth(), top);

    sheet.lineTo(left + this.getWidth() - this.getArrowHeadWidth(), 
    top + (this.getHeight() / 2) - (this.getArrowHeadHeight() / 2));
    sheet.lineTo(left + this.getWidth(), 
    top + (this.getHeight() / 2));
    sheet.lineTo(left + this.getWidth() - this.getArrowHeadWidth(), 
    top + (this.getHeight() / 2) + (this.getArrowHeadHeight() / 2));

    sheet.closePath();

    sheet.stroke();
    sheet.fill();
  }

} );

Canvas2D.Arrow.MANIFEST = {
  name         : "arrow",
  aliasses     : [ "pointer" ],
  properties   : { 
    arrowHeadWidth  : Canvas2D.Types.Size,
    arrowHeadHeight : Canvas2D.Types.Size,
  },
  propertyPath : [ Canvas2D.Rectangle ],
  libraries    : [ "Canvas2D" ]
};

Canvas2D.Arrow.Defaults = {};

Canvas2D.registerShape( Canvas2D.Arrow );
