Canvas2D.Line = Canvas2D.Shape.extend( {
  draw: function draw(sheet, left, top) {
    sheet.strokeStyle = this.getColor();
    sheet.lineWidth   = this.getLineWidth();
    sheet.lineStyle   = this.getLineStyle();

    sheet.beginPath();
    sheet.moveTo(left, top);
    sheet.lineTo(left + this.getWidth(), top + this.getHeight());
    sheet.stroke();
    sheet.closePath();
  }
} );

Canvas2D.Line.MANIFEST = {
  name     : "line",
  properties : {
    color     : Canvas2D.Types.Color(), 
    lineWidth : Canvas2D.Types.Size(),
    lineStyle : Canvas2D.Types.LineStyle()
  },
  libraries: [ "Canvas2D" ]
};

Canvas2D.registerShape( Canvas2D.Line );

Canvas2D.Line.Defaults = {
  color          : "black",
  lineWidth      : 1,
  lineStyle      : "solid",
  width          : 50,
  height         : 50
};
