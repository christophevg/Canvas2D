Canvas2D.DynamicSheet.Selection = Class.extend( {
  init: function init(sheet) {
    this.sheet = sheet;
    this.selections = [];
    this.markers    = {};
    this.groupShape = new Canvas2D.DynamicSheet.Selection.Position( 
                        new Canvas2D.DynamicSheet.Selection.Group( {
                          name: "Selection",
                          selection: this
                        } ) );
    this.groupMarker =
          new Canvas2D.DynamicSheet.Selection.Marker(this, this.groupShape );
  },

  move : function move(dx, dy) {
    this.groupShape.move( dx, dy ); // FIXME: groupShape should be on Sheet
    this.selections.iterate(function(position) {
      position.move(dx, dy);
      position.shape.getOnMouseDrag()(this.sheet, dx, dy );
    }.scope(this));
  },
  
  contains : function contains(shape) {
    return this.selections.contains(shape);
  },
  
  getSelectedShapes : function getSelectedShapes() {
    return this.selections;
  },

  addOnlyShape: function addOnlyShape(shape) {
    this.removeAllShapes();
    this.addShape(shape);
  },
  
  addShape: function addShape(shape) {
    if( shape.shape.getIsSelectable() ) {
      if( ! this.markers[shape.getName()] ) {
        this.markers[shape.getName()] = 
          new Canvas2D.DynamicSheet.Selection.Marker(this, shape);
      }
      this.selections.push(shape);
      this.markers[shape.getName()].show();
      this.sheet.fireEvent( "shapeSelected", shape );
      if( this.selections.length > 1 ) {
        this.groupMarker.show();
      }
    }
  },
  
  toString: function toString() {
    var names = [];
    this.selections.iterate(function(shape) { names.push(shape.getName()); });
    return names.join( ", " );
  },
  
  removeShape: function removeShape(shape) {
    if( shape.shape.getIsSelectable() ) {
      this.markers[shape.getName()].hide();
      this.selections.remove(shape);
      if( this.selections.length < 2 ) {
        this.groupMarker.hide();
      }
    }
  },
  
  removeAllShapes: function removeAllShapes() {
    while( this.selections.length > 0 ) {
      this.removeShape(this.selections[0]);
    }
  },
  
  hasSelectedShapes: function hasSelectedShares() {
    return this.selections.length > 0;    
  },
  
  hasMultipleSelectedShapes: function hasMultipleSelectedShapes() {
    return this.selections.length > 1;
  }
} );
