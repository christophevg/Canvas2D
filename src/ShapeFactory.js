Canvas2D.ShapeFactory = {
  createShape: function createShape(construct, parent) {
    var shape = Canvas2D.shapes.get(construct.type.toLowerCase());
    if( ! shape instanceof Canvas2D.Shape ) { return false; }

    if( shape.from ) {

      // TODO: REMOVE THIS ASAP !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      console.log( "WARNING: " + shape.getType() + ".from() is deprecated.");
      console.log( "WARNING: using old FROM !!!" );
      return shape.from( construct, parent );
      // TODO: REMOVE THIS ASAP !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    } else {
      var props = {};
      shape.getPropertiesConfig().iterate(
        function(prop, type) {
          type.extract(props, prop, construct, parent);
        }
      );
      // console.log( "constructing " + shape.getType() + " using :" ); console.log( props );

      return new shape(props);
    }
  }
};
