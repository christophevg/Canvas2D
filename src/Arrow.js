Canvas2D.Arrow = Canvas2D.Rectangle.extend( {
  draw: function draw(sheet, left, top) {
    // rect
    sheet.useCrispLines = this.getUseCrispLines();
    sheet.lineWidth     = this.getLineWidth();
    sheet.strokeStyle   = this.getLineColor();
    sheet.fillStyle     = this.getFillColor();

    /**           w
     *      <------------> 
     *                aw
     * l,t  +       <---->
     *    ^         3        ^  ah
     *    | 1       2        V
     * h  |              4   
     *    | 7       6
     *    v         5
     */
    var aw = this.getArrowHeadWidth();
    var ah = this.getArrowHeadHeight();
    var start = 
      { left: 0,               top: ah               }; // 1
    var points = [
      { left: this.width - aw, top: ah               }, // 2
      { left: this.width - aw, top: 0                }, // 3
      { left: this.width,      top: this.height / 2  }, // 4
      { left: this.width - aw, top: this.height      }, // 5
      { left: this.width - aw, top: this.height - ah }, // 6
      { left: 0,               top: this.height - ah }  // 7
    ];

    sheet.beginPath();
    sheet.moveTo( left + start.left, top + start.top );
    points.iterate( function(point) {
      sheet.lineTo( left + point.left, top + point.top );
    } );
    sheet.closePath();
    sheet.stroke();
    sheet.fill();
  }
} );

Canvas2D.Arrow.MANIFEST = {
  name         : "arrow",
  aliasses     : [ "pointer" ],
  properties   : { 
    arrowHeadWidth  : Canvas2D.Types.Size(),
    arrowHeadHeight : Canvas2D.Types.Size(),
  },
  propertyPath : [ Canvas2D.Rectangle ],
  libraries    : [ "Canvas2D" ]
};

Canvas2D.Arrow.Defaults = {
  arrowHeadWidth: 10,
  arrowHeadHeight: 10
};

Canvas2D.registerShape( Canvas2D.Arrow );
