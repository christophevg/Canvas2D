Canvas2D.Connector = Canvas2D.Shape.extend( {
  preprocess: function preprocess(props) {
    props = this._super(props);
    if( props.from == props.to ) { props.routing = "recursive"; }
    return props;
  },

  getFrom  : function(sheet) { 
    return sheet ? sheet.getPosition(this.from) : this.from; 
  },

  getTo    : function(sheet) { 
    return sheet ? sheet.getPosition(this.to)   : this.to;   
  },

  delayRender: function() { return true; },

  isValid: function() {
    return this.to != null && this.from != null;
  },

  draw: function(sheet, left, top) {
    if( !this.isValid() ) { return };
    
    sheet.save();
    sheet.useCrispLines = this.getUseCrispLines();
    sheet.strokeStyle   = this.getLineColor();
    sheet.lineWidth     = this.getLineWidth();
    sheet.lineStyle     = this.getLineStyle();

    sheet.beginPath();
    switch( this.getRouting() ) {
      case "custom":              this._custom    (sheet); break;
      case "recursive":           this._recursive (sheet); break;
      case "vertical":            this._vertical  (sheet); break;
      case "horizontal":          this._horizontal(sheet); break;
      case "direct":     default: this._direct    (sheet);
    }
    sheet.stroke();
    sheet.closePath();
    sheet.restore();
  },

  _custom: function _custom(sheet) {
    var beginShape = this.getFrom(sheet);
    var endShape   = this.getTo(sheet);
    var start      = beginShape.getPort(this.getRouteBegin());
    var end        = endShape.getPort(this.getRouteEnd());
    end   = this._draw_end_connector(sheet, end)
    start = this._draw_start_connector(sheet, start)
    switch( this.getRouteStyle() ) {
      case "corner":          this._draw_corner(sheet, start, end); break;
      case "tree"  :          this._draw_tree  (sheet, start, end); break;
      case "direct": default: this._draw_direct(sheet, start, end);
    }
  },
  
  _draw_direct : function _draw_direct(sheet, start, end) {
    sheet.lineTo(end.left, end.top);
  },
  
  _draw_corner : function _draw_corner( sheet, start, end ) {
    var direction = this.getRouteBegin().substring(0,1);
    if( direction == "n" || direction == "s" ) {
      sheet.lineTo( start.left, end.top );
    } else {
      sheet.lineTo( end.left, start.top );
    }
    sheet.lineTo( end.left, end.top   );
  },

  _draw_tree: function _draw_tree( sheet, start, end ) {
    var direction = this.getRouteBegin().substring(0,1);
    var dx = end.left - start.left;
    var dy = end.top  - start.top;
    if( direction == "n" || direction == "s" ) {
      sheet.lineTo( start.left, start.top + dy/2);
      sheet.lineTo( end.left  , start.top + dy/2);
    } else {
      sheet.lineTo( start.left + dx/2, start.top );
      sheet.lineTo( start.left + dx/2, end.top   );
    }    
    sheet.lineTo( end.left  , end.top);
  },

  _recursive: function _recursive(sheet) {
    var shape = this.getFrom(sheet);
    var start = shape.getPort("e");
    var end   = shape.getPort("n");
    var dw    = parseInt(shape.getWidth() / 4);
    var dh    = parseInt(shape.getHeight() / 4);
    var d     = 30;

    this.draw_start_connector(sheet, shape, "e", start.left, start.top - dh);
    sheet.lineTo(start.left + d, start.top - dh );
    sheet.lineTo(start.left + d, end.top - d );
    sheet.lineTo(end.left + dw, end.top - d );
    this.draw_end_connector(sheet, shape, "n", end.left + dw, end.top );
    sheet.lineTo(end.left + dw, end.top - d);
  },

  _draw_start_connector: function draw_start_connector(sheet, pos) {
    var connector = null;
    var dir       = this.getRouteBegin();

    if( this.getBegin() ) { 
      var connectors = this.getBegin();
      connector = connectors[dir] ? 
        connectors[dir] : connectors[dir.substring(0,1)];
    }

    return this._draw_connector(sheet, connector, pos.left, pos.top );
  },

  _draw_end_connector: function draw_start_connector(sheet, pos) {
    var connector = null;
    var dir       = this.getRouteEnd();

    if( this.getEnd() ) { 
      var connectors = this.getEnd();
      connector = connectors[dir] ? 
        connectors[dir] : connectors[dir.substring(0,1)];
    }

    return this._draw_connector(sheet, connector, pos.left, pos.top );
  },

  _direct: function(sheet) {
    var from, to;
    // TODO add connectors implementation
    // TODO start at intersection with border of box
    from = this.getFrom(sheet).getCenter();
    to   = this.getTo(sheet).getCenter();
    sheet.moveTo(from.left, from.top);
    sheet.lineTo(to.left,   to.top);
  },

  draw_start_connector: function draw_start_connector(sheet, shape, port, 
                                                      left, top) 
  {
    left = left || shape.getPort(port).left;
    top  = top  || shape.getPort(port).top;

    var connector = null;
    if( this.getBegin() ) { connector = this.getBegin()[port]; }

    return this._draw_connector(sheet, connector, left, top );
  },

  draw_end_connector: function start_connector(sheet, shape, port, left, top) {
    left = left || shape.getPort(port).left;
    top  = top  || shape.getPort(port).top;

    var connector = null;
    if( this.getEnd() ) { connector = this.getEnd()[port]; }

    return this._draw_connector(sheet, connector, left, top );
  },

  draw_connector: function(sheet, shape, port, left, top ) {
    left = left || shape.getPort(port).left;
    top  = top  || shape.getPort(port).top;

    var connector = null;
    if( shape == this.getFrom(sheet) && this.getBegin() ) {
      connector = this.getBegin()[port];
    }
    if( shape == this.getTo(sheet) && this.getEnd() ) {
      connector = this.getEnd()[port];
    }	

    return this._draw_connector(sheet, connector, left, top );
  },

  _draw_connector: function(sheet, connector, left, top) {
    sheet.moveTo(left, top);
    if( connector ) {
      var oldStyle = sheet.lineStyle;
      sheet.lineStyle = "solid";
      sheet.stroke();
      sheet.beginPath();
      sheet.moveTo(left, top);
      connector.lines.iterate(function(d){
        if(d == "fill") {
          sheet.fillStyle = "rgba( 0, 0, 0, 1 )";
          sheet.fill();
        } else {
          sheet.lineTo(left + d[0], top + d[1]);
        }
      });
      sheet.stroke();
      sheet.beginPath();
      sheet.lineStyle = oldStyle;
      sheet.moveTo(left + connector.end[0], top + connector.end[1]);
      return { left: left + connector.end[0], top: top + connector.end[1] };
    }
    return { left: left, top: top };
  },

  initialBranchLength: function(top, bottom) {
    return ( bottom - top ) / 2;
  },

  _vertical: function(sheet) {
    var top, bottom;
    if( this.getFrom(sheet).getBox().top < 
    this.getTo(sheet).getBox().top ) 
    {
      top    = this.getFrom(sheet);  
      bottom = this.getTo(sheet);
    } else {
      top    = this.getTo(sheet);    
      bottom = this.getFrom(sheet);
    }

    if( bottom.getBox().top - top.getBox().bottom >= 
    Canvas2D.Connector.Defaults.minTreeDist )
    {
      this._vertical_tree( sheet, top, bottom );
    } else if( bottom.getCenter().top - top.getBox().bottom 
      >= Canvas2D.Connector.Defaults.minCornerDist)
    {  
        this._vertical_corner( sheet, top, bottom );
    } else {
        this._vertical_line( sheet, this.getFrom(sheet), this.getTo(sheet));
    }
  },

  _vertical_tree: function( sheet, top, bottom ) {
    this.draw_connector(sheet, top, "s");

    var src = top.getPort("s");
    var trg = bottom.getPort("n");
    var dy1 = this.initialBranchLength( src.top, trg.top );

    sheet.lineTo(src.left, src.top + dy1);
    sheet.lineTo(trg.left, src.top + dy1);
    this.draw_connector( sheet, bottom, "n" );
    sheet.lineTo(trg.left, src.top + dy1);
  },

  _vertical_corner: function(sheet, top, bottom) {
    this.draw_connector( sheet, top, "s" );

    var src = top.getPort("s");
    var trgPort = src.left < bottom.getPort("w").left ? "w" : "e";
    var trg = bottom.getPort(trgPort);

    sheet.lineTo( src.left, trg.top );

    this.draw_connector( sheet, bottom, trgPort );
    sheet.lineTo(src.left, trg.top);
  },

  _vertical_line: function(sheet, from, to) {
    var fromPort, toPort;
    if( from.getBox().right < to.getBox().left ) {
      fromPort = "e"; toPort = "w";
    } else {
      fromPort = "w"; toPort = "e";
    }

    var y = from.getPort(fromPort).top -
    ( ( from.getPort(fromPort).top - to.getPort(toPort).top ) / 2 );
    var dx = (to.getPort(toPort).left - from.getPort(fromPort).left ) / 2;

    this.draw_connector( sheet, from, fromPort, null, y );
    sheet.lineTo( from.getPort(fromPort).left+dx, y);
    this.draw_connector( sheet, to,   toPort,   null, y );
    sheet.lineTo( from.getPort(fromPort).left+dx, y);
  },

  _horizontal: function(sheet) {
    var left, right;
    if( this.getFrom(sheet).getBox().left <
    this.getTo(sheet).getBox().left )
    {
      left  = this.getFrom(sheet); right = this.getTo(sheet);
    } else {
      left  = this.getTo(sheet);   right = this.getFrom(sheet);
    }

    if( right.getBox().left - left.getBox().right >= 
    Canvas2D.Connector.Defaults.minTreeDist )
    {
      this._horizontal_tree( sheet, left, right );
    } else if( right.getCenter().left - left.getBox().right 
      >= Canvas2D.Connector.Defaults.minCornerDist)
    {  
      this._horizontal_corner( sheet, left, right );
    } else {
      this._horizontal_line(sheet, this.getFrom(sheet), this.getTo(sheet));
    }
  },

  _horizontal_tree: function( sheet, left, right ) {
    this.draw_connector(sheet, left, "e");

    var src = left.getPort("e");
    var trg = right.getPort("w");
    var dx1 = this.initialBranchLength( src.left, trg.left );

    sheet.lineTo(src.left + dx1, src.top);
    sheet.lineTo(src.left + dx1, trg.top);

    this.draw_connector( sheet, right, "w" );
    sheet.lineTo(src.left + dx1, trg.top);
  },

  _horizontal_corner: function(sheet, left, right) {
    this.draw_connector( sheet, right, "w" );

    var src = right.getPort("w");
    var trgPort = src.top < left.getPort("n").top ? "n" : "s";
    var trg = left.getPort(trgPort);

    sheet.lineTo( trg.left, src.top );

    this.draw_connector( sheet, left, trgPort );
    sheet.lineTo(trg.left, src.top);
  },

  _horizontal_line: function(sheet, from, to) {
    var fromPort, toPort;
    if( from.getBox().bottom < to.getBox().top ) {
      fromPort = "s"; toPort = "n";
    } else {
      fromPort = "n"; toPort = "s";
    }

    var x = from.getPort(fromPort).left -
    ( ( from.getPort(fromPort).left - to.getPort(toPort).left ) / 2 );
    var dy = (to.getPort(toPort).top - from.getPort(fromPort).top ) / 2;

    this.draw_connector( sheet, from, fromPort, x );
    sheet.lineTo( x, from.getPort(fromPort).top+dy);

    this.draw_connector( sheet, to,   toPort,   x );
    sheet.lineTo( x, from.getPort(fromPort).top+dy);
  },

  hit: function(x,y) {
    // connectors aren't selectable (for now ;-))
    return false;
  },

  asConstruct: function() {
    var construct = this._super();

    if( this.getFrom() && this.getTo() ) {
      construct.modifiers[this.getFrom().getName() + "-" +
                          this.getTo().getName()] = null;
    }

    construct.modifiers[this.getRouting()] = null;
    if( this.getRouting() == "custom" ) {
      construct.annotation.data = this.getRouteStyle() + ":" +
                                  this.getRouteBegin() + "-" +
                                  this.getRouteEnd();
    }

    construct.addModifiers( [ "lineColor", "lineStyle",
                              "lineWidth", "begin",
                              "end" ] );

    return construct;
  }

} );

Canvas2D.Connector.from = function(construct, sheet) {
  var props = { name: construct.name };
  construct.modifiers.iterate(function(key, value) {
    if( value.value == null ) {
      if( key.contains("-") ) {
        var parts = key.split( "-" );
        props["from"] = sheet.shapesMap[parts[0]];
        props["to"]   = sheet.shapesMap[parts[1]];
      } else {
        props["routing"] = key;
        if( key == "custom" && construct.annotation && 
            construct.annotation.data &&
            construct.annotation.data.contains(":") &&
            construct.annotation.data.contains("-") ) 
            {
              var parts = construct.annotation.data.split(":");
              props["routeStyle"] = parts[0];
              var ends = parts[1].split("-");
              props["routeBegin"] = ends[0];
              props["routeEnd"]   = ends[1];
            }
      }
    } else {
      props[key] = ( key == "from" || key == "to" ) ? 
        sheet.shapesMap[value.value.value] : value.value.value;
      if( key == "begin" || key == "end" ) {
        props[key] = Canvas2D.CustomConnectors[props[key]];
      }
    }
  });

  errors = [];
  if( !props['from'] ) {
      errors.push( "Missing FROM connection-end on " + construct.name );
  }
  if( !props['to'] ) {
    errors.push( "Missing TO connection-end on " + construct.name   );
  }
  if( errors.length > 0 ) {
    return { errors: errors };
  } else {
    return new Canvas2D.Connector( props );
  }
};

Canvas2D.Connector.MANIFEST = {
  name         : "connector",
  aliasses     : [ "link" ],
  properties   : [ "lineColor", "lineStyle", "lineWidth", 
                   "from", "to", "begin", "end",
                   "routing", "routeStyle", "routeBegin", "routeEnd" ],
  libraries    : [ "Canvas2D" ]
};

Canvas2D.registerShape( Canvas2D.Connector );

Canvas2D.CustomConnectors = {};
Canvas2D.registerConnector = function registerConnector( name, connector ) {
  Canvas2D.CustomConnectors[name] = connector;
}
