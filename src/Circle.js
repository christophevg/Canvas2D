Canvas2D.Circle = Canvas2D.Shape.extend( {
  draw: function draw(sheet, left, top) {
    sheet.useCrispLines = this.getUseCrispLines();
    sheet.lineWidth     = this.getLineWidth();
    sheet.strokeStyle   = this.getLineColor();
    sheet.fillStyle     = this.getFill();

    var radius  = this.getRadius();
    // TODO: expose these are properties
    var startAngle    = 0;
    var endAngle      = Math.PI * 2;
    var anticlockwise = false;

    sheet.beginPath();
    sheet.arc(left, top, radius, startAngle, endAngle, anticlockwise);
    sheet.closePath();
    sheet.fill();
    sheet.stroke();
    
    this._super(sheet, left, top);
  }
} );

Canvas2D.Circle.MANIFEST = {
  name         : "circle",
  aliasses     : [ "arc" ],
  properties   : { 
    lineWidth    : new Canvas2D.Types.Size(), 
    lineColor    : new Canvas2D.Types.Color(),
    fill         : new Canvas2D.Types.Color(),
    line         : new Canvas2D.Types.Mapper( {
                     match : "^([^ ]+) (.+)$",
                     map   : [ "lineWidth", "lineColor" ]
                   } ),
    radius       : new Canvas2D.Types.Size({extractAsKey:true})
  },
  libraries    : [ "Canvas2D" ]
};

Canvas2D.registerShape( Canvas2D.Circle );

Canvas2D.Circle.Defaults = {
  name           : "newCircle",
  useCrispLines  : true,
  lineWidth      : 1,
  lineColor      : "rgba(0,0,0,100)",     // solid black
  fill           : "rgba(255,255,255,0)", // empty white ;-)
  labelPos       : "center",
  labelColor     : "black",
  radius         : 50
};
