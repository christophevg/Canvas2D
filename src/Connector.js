Canvas2D.Connector = Canvas2D.Shape.extend( {
  preprocess: function preprocess(props) {
    props = this._super(props);
    if( props.from == props.to ) { props.routing = "recursive"; }
    return props;
  },

  getFrom  : function getFrom(sheet) { 
    return sheet ? sheet.getPosition(this.from) : this.from; 
  },

  getTo    : function getTo(sheet) { 
    return sheet ? sheet.getPosition(this.to)   : this.to;   
  },

  delayRender: function delayRender() { return true; },

  isValid: function isValid() {
    return this.to != null && this.from != null;
  },

  draw: function draw(sheet, left, top) {
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
    
    this.addLabels(sheet);
    
    sheet.restore();
  },
  
  _custom: function _custom(sheet) {
    var beginShape = this.getFrom(sheet);
    var endShape   = this.getTo(sheet);
    var start      = beginShape.getPort(this.getRouteBegin());
    var end        = endShape.getPort(this.getRouteEnd());
    // straight is a special case for direct
    if( this.getRouteStyle() == "straight" ) {
      if( this.getRouteBegin() == "e" || this.getRouteBegin() == "w" ) {
        var y = start.top - ( ( start.top - end.top ) / 2 );
        start.top = y;
        end.top   = y;
      } else {
        var x = start.left - ( ( start.left - end.left ) / 2 );
        start.left = x;
        end.left   = x;
      }
    }
    
    // label positions and alignment for begin and end
    var offset = { "e" : { left: +5, top: -5, align: "left"  },
                   "n" : { left: +5, top: -5, align: "left"  },
                   "w" : { left: -5, top: -5, align: "right" },
                   "s" : { left: +5, top: +10, align: "left"  } };

    var dir;
    if( this.getRouteBegin() ) {
      dir = this.getRouteBegin().substring(0,1);
      this.beginLabelPos = { left: start.left + offset[dir].left,
                             top:  start.top  + offset[dir].top };
      this.beginLabelAlign = offset[dir].align;
    } else {
      console.log( "WARNING: missing routeBegin on " + this.name );
    }

    if( this.getRouteEnd() ) {
      dir = this.getRouteEnd().substring(0,1);
      this.endLabelPos = { left: end.left + offset[dir].left,
                           top:  end.top  + offset[dir].top };
      this.endLabelAlign = offset[dir].align;
    } else {
      console.log( "WARNING: missing routeBegin on " + this.name );
    }
    
    // draw connectors
    end   = this._draw_end_connector(sheet, end)
    start = this._draw_start_connector(sheet, start)

    // choose special drawing algorithm
    switch( this.getRouteStyle() ) {
      case "corner"    : this._draw_corner   (sheet, start, end); break;
      case "tree"      : this._draw_tree     (sheet, start, end); break;
      case "recursive" : this._draw_recursive(sheet, start, end); break;
      default:
        var l = start.left - (( start.left - end.left ) / 2 );
        var t = start.top  - (( start.top  - end.top  ) / 2 );
        if( start.top == end.top ) { t -= 5; }
        this.centerLabelPos = { left: l, top: t };
    }
    sheet.lineTo( end.left, end.top );
  },
  
  addLabels: function addLabels(sheet) {
    if( this.getBeginLabel() && this.getBeginLabelPos() ) {
      this.addLabel( sheet, this.getBeginLabel(), 
                     this.getBeginLabelPos(), this.getBeginLabelAlign() );
    }
    if( this.getEndLabel() && this.getEndLabelPos() ) {
      this.addLabel( sheet, this.getEndLabel(),
                     this.getEndLabelPos(),   this.getEndLabelAlign() );
    }
    if( this.getCenterLabel() && this.getCenterLabelPos() ) {
      this.addLabel(sheet, this.getCenterLabel(),
                    this.getCenterLabelPos(), "center");
    }
  },
  
  addLabel: function addLabel(sheet, label, pos, align) {
    sheet.save();
    sheet.textAlign = align || "left";
    sheet.font = this.getLabelFont();
    sheet.fillText(label, pos.left, pos.top);
    sheet.restore();
  },
  
  getBeginLabelPos: function getBeginLabelPos() { 
    return this.beginLabelPos; 
  },
  
  getEndLabelPos: function getEndLabelPos() { 
    return this.endLabelPos; 
  },
  
  getCenterLabelPos: function getCenterLabelPos() { 
    return this.centerLabelPos; 
  },
  
  getBeginLabelAlign: function getBeginLabelAlign() {
    return this.beginLabelAlign || "left";    
  },
  
  getEndLabelAlign: function getEndLabelAlign() {
    return this.endLabelAlign || "left";
  },
  
  _draw_corner : function _draw_corner( sheet, start, end ) {
    var dir = this.getRouteBegin().substring(0,1);
    if( dir == "n" || dir == "s" ) {
      sheet.lineTo( start.left, end.top );
      this.centerLabelPos = { left: start.left, 
                              top: end.top + ( dir == "n" ? -5 : 10 ) };
    } else {
      sheet.lineTo( end.left, start.top );
      this.centerLabelPos = { left: end.left, 
                              top: start.top + ( dir =="e" ? -5 : 10 ) };      
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
      this.centerLabelPos = { left: start.left - ((start.left - end.left )/2),
                              top: start.top + (dy/2) + 10 };
    } else {
      sheet.lineTo( start.left + dx/2, start.top );
      sheet.lineTo( start.left + dx/2, end.top   );
      this.centerLabelPos = { left: start.left + (dx/2),
                              top: start.top - ((start.top - end.top )/2) - 5 };
    }    
  },

  _draw_recursive : function _draw_recursive(sheet, start, end) {
    var e = 30;
    var sl = start.left;  var st = start.top;
    var el = end.left;    var et = end.top;
    var mapping = { "e" : [ [ sl+e, st ], [ sl+e, et-e ], [ el, et-e ] ],
                    "n" : [ [ sl, st-e ], [ el-e, st-e ], [ el-e, et ] ],
                    "w" : [ [ sl-e, st ], [ sl-e, et+e ], [ el, et+e ] ],
                    "s" : [ [ sl, st+e ], [ el+e, st+e ], [ el+e, et ] ] };
    var orientation = this.getRouteBegin().substring(0,1);
    var d = mapping[orientation];

    sheet.lineTo( d[0][0], d[0][1] );
    sheet.lineTo( d[1][0], d[1][1] );
    sheet.lineTo( d[2][0], d[2][1] );

    var offset = { "e" : { left: 0, top: -5 }, 
                   "n" : { left: 0, top: -5 },
                   "w" : { left: 0, top: +10 },
                   "s" : { left: 0, top: +10 } };
    this.centerLabelPos = { left: d[1][0] + offset[orientation].left, 
                            top: d[1][1] + offset[orientation].top};
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
  
  _draw_connector: function _draw_connector(sheet, connector, left, top) {
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

  _direct: function _direct(sheet) {
    var from = this.getFrom(sheet).getCenter();
    var to   = this.getTo(sheet).getCenter();

    // top : left : [ from, to ]
    var mapping = { "-1" : { "-1" : [ "nw", "se" ],
                              "0" : [ "n" , "s"  ],
                              "1" : [ "ne", "sw" ] },
                    "0"  : { "-1" : [ "w" , "e"  ],
                              "0" : [ "n",  "s"  ],
                              "1" : [ "e",  "w"  ] },
                    "1"  : { "-1" : [ "sw", "ne" ],
                              "0" : [ "s",  "n"  ],
                              "1" : [ "se", "nw" ] } };
    var m = 100;                            
    var top  = to.top - from.top;
    top = Math.round( top / m ) * m;
    if( top != 0 ) { top /= Math.abs(top); }
    var left = to.left - from.left;
    left = Math.round( left / m ) * m;
    if( left != 0 ) { left /= Math.abs(left); }
    var route = mapping[top][left];

    // translate to new routing system
    this.routeStyle = 'direct';
    this.routeBegin = route[0];
    this.routeEnd   = route[1];

    // and call it
    this._custom(sheet);
  },
  
  _recursive: function _recursive(sheet) {
    this.routeStyle = "recursive";
    this.routeBegin = this.routeBegin || "ene";
    var mapping = { "nnw" : "wnw", "ene" : "nne",  
                    "wsw" : "ssw", "sse" : "ese" };
    this.routeEnd   = mapping[this.routeBegin];
    this._custom(sheet);
  },

  _vertical: function _vertical(sheet) {
    var from    = this.getFrom(sheet);
    var to      = this.getTo(sheet);
    var reverse = from.getBox().top < to.getBox().top;
    var dist1   = reverse ? to.getBox().top   - from.getBox().bottom
                          : from.getBox().top - to.getBox().bottom;
    var dist2   = reverse ? to.getCenter().top - from.getBox().bottom
                          : from.getCenter().top - to.getBox().bottom;
    
    if( dist1 >= Canvas2D.Connector.Defaults.minTreeDist ) {
      this.routeStyle = "tree";
      this.routeBegin = reverse ? "s" : "n";
      this.routeEnd   = reverse ? "n" : "s";
    } else if( dist2 >= Canvas2D.Connector.Defaults.minCornerDist ) {  
      this.routeStyle = "corner";
      this.routeBegin = reverse ? "s" : "n";
      this.routeEnd   = from.getPort(this.routeBegin).left < 
                          to.getPort("w").left ? "w" : "e";
    } else {
      this.routeStyle = "straight";
      this.routeBegin = from.getPort("e").left < 
                          to.getPort("w").left ? "e" : "w";
      this.routeEnd   = this.routeBegin == "e" ? "w" : "e";
    }
    this._custom(sheet);
  },

  _horizontal: function _horizontal(sheet) {
    var from    = this.getFrom(sheet);
    var to      = this.getTo(sheet);
    var reverse = from.getBox().left < to.getBox().left;
    var dist1   = reverse ? to.getBox().left   - from.getBox().right
                          : from.getBox().left - to.getBox().right;
    var dist2   = reverse ? to.getCenter().left - from.getBox().right
                          : from.getCenter().left - to.getBox().right;
    
    if( dist1 >= Canvas2D.Connector.Defaults.minTreeDist ) {
      this.routeStyle = "tree";
      this.routeBegin = reverse ? "e" : "w";
      this.routeEnd   = reverse ? "w" : "e";
    } else if( dist2 >= Canvas2D.Connector.Defaults.minCornerDist ) {  
      this.routeStyle = "corner";
      this.routeBegin = reverse ? "e" : "w";
      this.routeEnd   = from.getPort(this.routeBegin).top < 
                          to.getPort("n").top ? "n" : "s";
    } else {
      this.routeStyle = "straight";
      this.routeBegin = from.getPort("s").top < 
                          to.getPort("n").top ? "s" : "n";
      this.routeEnd   = this.routeBegin == "n" ? "s" : "n";
    }
    this._custom(sheet);
  },
  
  initialBranchLength: function initialBranchLength(top, bottom) {
    return ( bottom - top ) / 2;
  },

  hit: function hit(x,y) {
    // connectors aren't selectable (for now ;-))
    return false;
  },

  asConstruct: function asConstruct() {
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

    construct.addModifiers( [ "lineColor", "lineStyle", "lineWidth", 
                              "begin", "end",
                              "beginLabel", "centerLabel", "endLabel" ] );

    if( this.getRouting() == "recursive" && this.getRouteBegin() != "ene" ) {
      construct.addModifiers( [ "routeBegin" ] );
    }
    return construct;
  }
} );

Canvas2D.Connector.from = function from(construct, sheet) {
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
  warnings = [];
  if( !props['from'] ) {
      errors.push( "Missing FROM connection-end on " + construct.name );
  }
  if( !props['to'] ) {
    errors.push( "Missing TO connection-end on " + construct.name   );
  }
  if( !["vertical","horizontal","direct","custom"].has(props["routing"]) ){
    warnings.push( "unknown routing: " + props["routing"] + 
                   ", defaulting to direct." );
  }
  
  var result = {};
  
  if( warnings.length > 0 ) {
    result.warnings = warnings;
  }

  if( errors.length > 0 ) {
    result.errors = errors;
  } else {
    var elem = new Canvas2D.Connector( props );
    elem.warnings = result.warnings;
    result = elem;
  }

  return result;
};

Canvas2D.Connector.MANIFEST = {
  name         : "connector",
  aliasses     : [ "link" ],
  properties   : [ "lineColor", "lineStyle", "lineWidth", 
                   "from", "to", "begin", "end",
                   "routing", "routeStyle", "routeBegin", "routeEnd",
                   "beginLabel", "centerLabel", "endLabel" ],
  libraries    : [ "Canvas2D" ]
};

Canvas2D.registerShape( Canvas2D.Connector );

Canvas2D.CustomConnectors = {};
Canvas2D.registerConnector = function registerConnector( name, connector ) {
  Canvas2D.CustomConnectors[name] = connector;
}
