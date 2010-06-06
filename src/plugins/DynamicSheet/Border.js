Canvas2D.DynamicSheet.Selection.Marker.Border = Canvas2D.Rectangle.extend( {
  beforeInit: function beforeInit(props) {
    this.marker = props.marker;
    this.padding = props.padding;
    delete props.marker;
    delete props.padding;
    return props;
  },
  
  getWidth: function getWidth() {
    return this.marker.shape.getWidth() + this.padding * 2;
  },
  
  getHeight: function getHeight() {
    return this.marker.shape.getHeight() + this.padding * 2;
  },
  
  getLineColor: function getLineColor() {
    return this.marker.getColor();
  },

  hit: function hit() {
    return false;
  }
} );

Canvas2D.DynamicSheet.Selection.Marker.Border.Defaults = {
  isSelectable : false
}

Canvas2D.DynamicSheet.Selection.Marker.Border.MANIFEST = {
  name         : "SelectionMarkerBorder",
  propertyPath : [ Canvas2D.Rectangle ],
}
Canvas2D.registerShape(Canvas2D.DynamicSheet.Selection.Marker.Border);
