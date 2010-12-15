Canvas2D.DynamicSheet.Selection.Overlay = Class.extend( {
  init: function init(sheet) {
    this.sheet = sheet;
    this.overlay = new Canvas2D.Rectangle( { 
      name: "SelectionOverlay",
      lineColor: "rgba( 0, 255, 0, 0.1 )",
      fillColor: "rgba( 0, 255, 0, 0.1 )",
      isSelectable: false
    } );
    this.overlay.asConstruct = function() { return null; }
  },

  show: function show() {
    this.sheet.add( this.overlay );
  },

  hide: function hide() {
    this.sheet.remove( this.overlay );
  },
  
  set: function set( from, to ) {
    var position = this.sheet.getPosition(this.overlay);
    var left = to.x <= from.x ? to.x : from.x;
    var top = to.y <= from.y ? to.y : from.y;
    position.setLeft( left );
    position.setTop ( top );
    var width  = Math.abs(to.x - from.x);
    var height = Math.abs(to.y - from.y);
    this.overlay.setWidth( width );
    this.overlay.setHeight( height );
  }
} );
