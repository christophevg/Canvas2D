Canvas2D.Text = Canvas2D.Shape.extend( {
  beforeRender: function beforeRender(sheet) {
    this.width  = sheet.measureText(this.getText());
    this.height = sheet.getFontSize();
  },

  draw: function draw(sheet, left, top) {
    top += this.getHeight();
    sheet.useCrispLines  = this.getUseCrispLines();
    sheet.strokeStyle    = this.getColor();
    sheet.fillStyle      = this.getColor();
    sheet.font           = this.getFont();
    sheet.textAlign      = this.getTextAlign();
    sheet.textDecoration = this.getTextDecoration();

    sheet.fillText(this.getText(), left, top );
  }
} );

Canvas2D.Text.MANIFEST = {
  name         : "text",
  properties   : { 
    text           : Canvas2D.Types.Text({extractFrom:"ADL.Value"}),
    color          : Canvas2D.Types.Color(), 
    font           : Canvas2D.Types.Font(), 
    textAlign      : Canvas2D.Types.Align(),
    textDecoration : Canvas2D.Types.FontDecoration()
  },
  libraries    : [ "Canvas2D" ]
};

Canvas2D.Text.Defaults = {
  useCrispLines  : false,
  color          : "black",
  font           : "10pt Sans-Serif", 
  textAlign      : "left", 
  textDecoration : "none"
};

Canvas2D.registerShape( Canvas2D.Text );
