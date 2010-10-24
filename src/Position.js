Canvas2D.Position = Class.extend( {
  init: function( shape, left, top ) {
    this.shape = shape;
    this.left  = left || null;
    this.top   = top  || null;
  },

  asConstruct: function asConstruct() {
    var construct = this.shape.asConstruct();
    if( this.getLeft() !== null && this.getTop() !== null ) {
      construct.addAnnotation(this.getLeft() + "," + this.getTop() );
    }
    return construct;
  },

  getLeft: function() { return this.left; },
  getTop : function() { return this.top;  },
  
  setLeft: function(newLeft) { this.left = newLeft; },
  setTop : function(newTop)  { this.top  = newTop;  },
  
  getWidth : function() { return this.shape.getWidth();  },
  getHeight: function() { return this.shape.getHeight(); },

  getCenter: function() { 
    var center = this.shape.getCenter();
    center.left += this.getLeft();
    center.top += this.getTop();
    return center;
  },

  getBox: function() {
    return { left  : this.getLeft(), 
      right : this.getLeft() + this.shape.getWidth(),
      top   : this.getTop(),
      bottom: this.getTop()  + this.shape.getHeight() 
    };
  },

  getPort: function(port) {
    var portPos = this.shape.getPort(port);
    portPos.left += this.getLeft();
    portPos.top  += this.getTop();
    return portPos;
  },

  render: function( sheet ) {
    var origin = sheet.getOrigin() || { left: 0, top: 0 };
    this.shape.render( sheet, this.getLeft() + origin.left, 
                              this.getTop()  + origin.top );
  },

  move: function( dleft, dtop ) {
    this.left += dleft;
    this.top  += dtop;
    this.fireEvent( "change", 
    "from " + this.getLeft() - dleft + "," + this.getTop() - dtop +
    " to " + this.getLeft() + "," + this.getTop() );
    this.fireEvent( "move", { x: dleft, y: dtop } );
  },
  
  moveTo: function( left, top ) {
    this.left = left;
    this.top  = top;
  },
  
  resize: function( dx, dy ) {
    this.shape.resize( dx, dy );
  },

  getName: function() {
    return this.shape.getName();
  },

  hit: function(x,y) {
    var rx = x - this.getLeft();
    var ry = y - this.getTop();
    if( rx < 0 || ry < 0 ) { return false; }
    return this.shape.hit(rx, ry);
  },

  hitArea: function(left, top, right, bottom) {
    var rleft   = left   - this.getLeft();
    var rtop    = top    - this.getTop();
    var rright  = right  - this.getLeft();
    var rbottom = bottom - this.getTop();
    return this.shape.hitArea(min(rleft,rright), 
    min(rtop,rbottom), 
    max(rleft,rright), 
    max(rtop,rbottom));

  },

  delayRender: function() {
    return this.shape.delayRender();
  }
});

ProtoJS.mix( Canvas2D.Factory.extensions.all.EventHandling,
  Canvas2D.Position.prototype );
