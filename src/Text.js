Canvas2D.Text = Canvas2D.Shape.extend( {
  // TODO : change to beforeInit(props) ???
  beforeRender: function beforeRender(sheet) {
    sheet.useCrispLines  = this.getUseCrispLines();
    sheet.strokeStyle    = this.getColor();
    sheet.fillStyle      = this.getColor();
    sheet.font           = this.getFont();
    sheet.textAlign      = this.getTextAlign();
    sheet.textDecoration = this.getTextDecoration();
    this.width  = sheet.measureText(this.getText());
    this.height = sheet.getFontSize();
  },

  draw: function draw(sheet, left, top) {
    sheet.fillText(this.getText(), left, top );
  }
} );

Canvas2D.Text.MANIFEST = {
  name         : "text",
  properties   : { 
    "text"           : Canvas2D.Types.Text, 
    "color"          : Canvas2D.Types.Color, 
    "font"           : Canvas2D.Types.Font, 
    "textAlign"      : Canvas2D.Types.Align,
    "textDecoration" : Canvas2D.Types.FontDecoration
  },
  libraries    : [ "Canvas2D" ]
};

Canvas2D.registerShape( Canvas2D.Text );

Canvas2D.Text.Defaults = {
  useCrispLines  : false,
  color          : "black",
  font           : "10pt Sans-Serif", 
  textAlign      : "left", 
  textDecoration : "none"
};
