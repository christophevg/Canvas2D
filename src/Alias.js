Canvas2D.Alias = Canvas2D.Shape.extend( {} );

Canvas2D.Alias.mapper = {
  sheet : function(shape) { 
    return function(construct, parent) {
      construct.type = "sheet";
      return Canvas2D.ShapeFactory.createShape(construct, parent);
    };
  },

  connector : function(shape) {
    return function(construct, parent) { 
      var modifier = new ADL.Modifier( "routing", new ADL.String("vertical"));
      construct.modifiers.set( modifier.key, modifier );
      construct.type = "connector";
      return Canvas2D.ShapeFactory.createShape(construct, parent);
    };
  },

  image : function(shape) {
    var modifiers = shape.modifiers;
    return function( construct, parent ) {
      modifiers.iterate(function(key, value) {
        construct.modifiers.set(key, value); 
      } );
      construct.type = "image";
      return Canvas2D.ShapeFactory.createShape(construct, parent);
    };
  }
};

Canvas2D.Alias.from = function( construct, parent ) {
  Canvas2D.registerShape( { 
    prototype : {},
    MANIFEST : { 
      name      : construct.name,
      libraries : [ "Aliasses" ]
    },
    from: Canvas2D.Alias.mapper[construct.supers[0]](construct, parent)
  } );
};

Canvas2D.Alias.MANIFEST = {
  name     : "alias",
  libraries: [] 
};

Canvas2D.registerShape( Canvas2D.Alias );
