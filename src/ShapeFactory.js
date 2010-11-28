Canvas2D.ShapeFactory = {
  createShape: function createShape(construct, parent) {
    var shape = Canvas2D.shapes.get(construct.type.toLowerCase());
    if( ! shape || ! shape instanceof Canvas2D.Shape ) { return false; }

    if( shape.from ) {
      // TODO: REMOVE THIS ASAP !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      console.log( "WARNING: " + shape.getType() + ".from() is deprecated.");
      console.log( "WARNING: using old FROM !!!" );
      return shape.from( construct, parent );
      // TODO: REMOVE THIS ASAP !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    }

    var properties = { __parent: parent };
    var propertiesConfig = shape.getPropertiesConfig();
    propertiesConfig.iterate(
      function(prop, type) {
        type.setPropertiesConfig(propertiesConfig);
        type.extract(properties, prop, construct, parent);
      }
    );
    
    //console.log( "constructing " + shape.getType() + " using :" ); console.log( props );
    return new shape(properties);
  }
};
