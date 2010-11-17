Canvas2D.DynamicSheet.Selection.Marker = Class.extend( {
  init: function init(selection, shape) {
    this.selection  = selection;
    this.sheet      = this.selection.sheet;
    this.shape      = shape;
    this.showing    = false;
    this.marks      = {};
    this.isGroupMarker = shape instanceof Canvas2D.DynamicSheet.Selection.Position;

    this.setupMarker();
  },
  
  isOnlySelection: function isOnlySelection() {
    return ! this.selection.hasMultipleSelectedShapes();
  },
  
  isShowingBoxes: function isShowBoxes() {
    return this.isOnlySelection() || this.isGroupMarker;
  },
  
  getColor: function getColor() {
    return ( this.isOnlySelection() || this.isGroupMarker ) ? 
      "rgb(0,255,0)" : "rgb(255,0,255)";
  },
  
  setupMarker: function setupMarker() {
    $H({ 
      topLeft      : { width: -1, height: -1, left: 1, top: 1 }, 
      topCenter    : { width:  0, height: -1, left: 0, top: 1 }, 
      topRight     : { width:  1, height: -1, left: 0, top: 1 },
      centerRight  : { width:  1, height:  0, left: 0, top: 0 }, 
      bottomRight  : { width:  1, height:  1, left: 0, top: 0 }, 
      bottomCenter : { width:  0, height:  1, left: 0, top: 0 },
      bottomLeft   : { width: -1, height:  1, left: 1, top: 0 }, 
      centerLeft   : { width: -1, height:  0, left: 1, top: 0 }
    }).iterate( function(handle, sizers) { 
      this.marks[handle] = 
        new Canvas2D.DynamicSheet.Selection.Marker.Box({
          name: "marker-" + this.shape.getName() + "-" + handle,
          sizers: sizers, marker: this
        }); 
    }.scope(this) );


    this.border = new Canvas2D.DynamicSheet.Selection.Marker.Border({
      name : "marker-" + this.shape.getName() + "-border",
      marker : this,
      padding: ( this.isGroupMarker ? 5 : 1 )
    });

    this.shape.on( "move", this.move.scope(this) );           // position
    this.shape.shape.on( "resize", this.resize.scope(this) ); // size
  },

  show: function show() {
    if( this.shape.shape.getHideSelection() ) { return; }
    var box = this.shape.getBox();
    var dx = ( box.right - box.left ) / 2;
    var dy = ( box.bottom - box.top ) / 2;
    var ds = 3;

    var padding = this.isGroupMarker ? 5 : 1;

    this.sheet.at(box.left - padding, box.top - padding ).put(this.border);

    this.sheet.at(box.left  -ds - padding, box.top    -ds -padding)
              .put(this.marks.topLeft    );
    this.sheet.at(box.left  +dx   , box.top    -ds -padding)
              .put(this.marks.topCenter  );
    this.sheet.at(box.right -ds +padding, box.top    -ds -padding)
              .put(this.marks.topRight   );
    this.sheet.at(box.right -ds +padding, box.top    +dy   )
              .put(this.marks.centerRight);
    this.sheet.at(box.right -ds +padding, box.bottom -ds +padding)
              .put(this.marks.bottomRight);
    this.sheet.at(box.right -dx   , box.bottom -ds +padding)
              .put(this.marks.bottomCenter);
    this.sheet.at(box.left  -ds -padding, box.bottom -ds +padding)
              .put(this.marks.bottomLeft );
    this.sheet.at(box.left  -ds -padding, box.bottom -dy)
              .put(this.marks.centerLeft );

    this.showing = true;
  },

  move: function move(d) {
    if( ! this.showing ) { return; }
    var dx = d.x, dy = d.y;
    $H(this.marks).iterate(function(key, mark) {
      var position = this.sheet.getPosition(mark);
      position.move(dx, dy);
    }.scope(this) );
    this.sheet.getPosition(this.border).move(dx, dy);
  },

  resize: function resize(dw, dh) {
    if( ! this.showing ) { return; }

    var box = this.shape.getBox();
    var dx = ( box.right - box.left ) / 2;
    var dy = ( box.bottom - box.top ) / 2;
    var ds = 3;

    var padding = this.isGroupMarker ? 5 : 1;

    $H({
      topLeft     : { left : box.left   -ds -padding    ,
                      top  : box.top    -ds -padding     },
      topCenter   : { left : box.left                +dx,
                      top  : box.top    -ds -padding     },
      topRight    : { left : box.right  -ds +padding    ,
                      top  : box.top    -ds -padding     },
      centerRight : { left : box.right  -ds +padding    ,
                      top  : box.top                 +dy },
      bottomRight : { left : box.right  -ds +padding    ,
                      top  : box.bottom -ds +padding     },
      bottomCenter: { left : box.right               -dx,
                      top  : box.bottom -ds +padding     },
      bottomLeft  : { left : box.left   -ds -padding    ,
                      top  : box.bottom -ds +padding     },
      centerLeft  : { left : box.left   -ds -padding    ,
                      top  : box.bottom              -dy }
    }).iterate(function( name, change ) {
      this.sheet.getPosition(this.marks[name]).moveTo(change.left, change.top);
    }.scope(this));
  },

  hide: function hide() {
    if( ! this.showing ) { return; }
    $H(this.marks).iterate(function(key, mark) {
      this.sheet.remove(mark);
    }.scope(this) );
    this.sheet.remove(this.border);
    this.showing = false;
  }
} );
