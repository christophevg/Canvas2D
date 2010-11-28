Canvas2D.ShapeFactory = {
  createShape: function createShape(construct, parent) {
    var shape = Canvas2D.shapes.get(construct.type.toLowerCase());
    if( ! shape || ! shape instanceof Canvas2D.Shape ) { 
      this.errors = [ "Unknown Construct Type: " + construct.type ];
      return false; 
    }

    var properties = { __parent: parent };
    var propertiesConfig = shape.getPropertiesConfig();
    propertiesConfig.iterate(
      function(prop, type) {
        type.setPropertiesConfig(propertiesConfig);
        type.extract(properties, prop, construct, parent);
      }
    );

    // allow a shape to take control
    if( shape.from ) { return shape.from( construct, parent ); }
    
    //console.log( "constructing " + shape.getType() + " using :" ); console.log( props );
    return new shape(properties);
  }
};
