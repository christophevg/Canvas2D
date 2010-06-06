Canvas2D.DynamicSheet.Selection.Marker.Box = Canvas2D.Rectangle.extend( {
  beforeInit: function beforeInit(props) {
    this.marker = props.marker;
    delete props.marker;
    return props;
  },
  
  getFillColor: function getFillColor() {
    return this.marker.getColor();
  },
  
  getIsVisible: function getIsVisible() {
    return this.marker.isShowingBoxes();
  },

  hit: function hit() {
    return false;
  }
} );

Canvas2D.DynamicSheet.Selection.Marker.Box.Defaults = {
  width        : 6,
  height       : 6,
  lineColor    : "black",
  isSelectable : false 
}

Canvas2D.DynamicSheet.Selection.Marker.Box.MANIFEST = {
  name         : "SelectionMarkerBox",
  propertyPath : [ Canvas2D.Rectangle ],
}
Canvas2D.registerShape(Canvas2D.DynamicSheet.Selection.Marker.Box);