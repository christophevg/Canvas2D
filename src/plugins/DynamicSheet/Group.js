// TODO: this can be moved up to a generic Group Shape (but should it?)
Canvas2D.DynamicSheet.Selection.Group = Canvas2D.Shape.extend( {
  beforeInit: function beforeInit(props) {
    this.selection = props.selection;
    delete props.selection;
    return props;
  },
  
  getBox: function getBox() {
    var minLeft = null, minTop = null, maxRight = null, maxBottom = null;
    var shapes = this.selection.getSelectedShapes();
    if( shapes.length === 0 ) {
      return { left: 0, top: 0, right: 0, bottom: 0 };
    } else {
      shapes.iterate(function(shape) {
        var box = shape.getBox();
        if( minLeft   === null || box.left   < minLeft   ) { minLeft   = box.left;   }
        if( minTop    === null || box.top    < minTop    ) { minTop    = box.top ;   }
        if( maxRight  === null || box.right  > maxRight  ) { maxRight  = box.right;  }
        if( maxBottom === null || box.bottom > maxBottom ) { maxBottom = box.bottom; }
      } );
      return { left: minLeft, top: minTop, right: maxRight, bottom: maxBottom };
    }
  },
  
  getWidth: function getWidth() {
    var box = this.getBox();
    return box.right - box.left;
  },
  
  getHeight: function getHeight() {
    var box = this.getBox();
    return box.bottom - box.top;
  },
  
  hit: function hit() {
    return false;
  },
  
  hitArea: function hitArea() {
    return false;
  }
} );

Canvas2D.DynamicSheet.Selection.Group.Defaults = {
  isSelectable : false,
  isVisible    : false
};

Canvas2D.DynamicSheet.Selection.Group.MANIFEST = {
  name         : "SelectionGroup"
};

Canvas2D.registerShape(Canvas2D.DynamicSheet.Selection.Group);
