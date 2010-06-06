Canvas2D.DynamicSheet.Selection.Position = Canvas2D.Position.extend( {
  getLeft: function getLeft() {
    return this.shape.getBox().left;
  },
  
  getTop: function getTop() {
    return this.shape.getBox().top;
  },
  
  getBox: function getBox() {
    return this.shape.getBox();
  }
} );
