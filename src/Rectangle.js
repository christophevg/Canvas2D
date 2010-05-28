Canvas2D.Rectangle = Canvas2D.CompositeShape.extend( {
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
  },

  getCenter: function() {
    return { left: this.getWidth()  / 2, top:  this.getHeight() / 2 };
  },

  getPort: function(side) {
    var modifiers = { nw:  { left: 0,    top: 0   },
                      nnw: { left: 0.25, top: 0   },
                      n  : { left: 0.5,  top: 0   }, 
                      nne: { left: 0.75, top: 0   },
                      ne : { left: 1,    top: 0   },
                      ene: { left: 1,    top: 0.25},
                      e  : { left: 1,    top: 0.5 },
                      ese: { left: 1,    top: 0.75},
                      se : { left: 1,    top: 1   },
                      sse: { left: 0.75, top: 1   },
                      s  : { left: 0.5,  top: 1   },
                      ssw: { left: 0.25, top: 1   },
                      sw:  { left: 0,    top: 1   },
                      wsw: { left: 0,    top: 0.75},
                      w  : { left: 0,    top: 0.5 },
                      wnw: { left: 0,    top: 0.25} };
    
    if (!modifiers[side]) {
	return { left: 0, top: 0 };
    }
    
    return { left: modifiers[side].left * this.getWidth(),
             top:  modifiers[side].top  * this.getHeight() };
  },

  getGeo: function() {
    return this.getWidth() && this.getHeight() ?
    this.getWidth() + "x" + this.getHeight() : null;
  },
  
  asConstruct: function() {
    var construct = this._super();
    construct.addModifiers( [ "geo", "lineColor", "roundCorners" ] );
    return construct;
  }
} );

Canvas2D.Rectangle.from = function( construct, sheet ) {
  var props = { name: construct.name };
  
  construct.modifiers.iterate(function(key, value) {
    value = ( value.value ? value.value.value : "" );

    if( key == "width" || key == "height" ) {
      value = parseInt(value);
    }

    if( key == "geo" ) {
      props["width"]   = parseInt(value.split("x")[0]);
      props["height"]  = parseInt(value.split("x")[1]);
    }

    if( "" + value == "" ) {
      if( key == "roundCorners" ) {
        value = true;
      } else {
        value = key;
        key = "lineColor";
      }
    }

    props[key] = value;
  } );

  return new Canvas2D.Rectangle(props);
};

Canvas2D.Rectangle.MANIFEST = {
  name         : "rectangle",
  aliasses     : [ "box" ],
  properties   : [ "lineWidth", "lineColor", "fillColor", "roundCorners" ],
  propertyPath : [ Canvas2D.CompositeShape ],
  libraries    : [ "Canvas2D" ]
};

Canvas2D.registerShape( Canvas2D.Rectangle );
