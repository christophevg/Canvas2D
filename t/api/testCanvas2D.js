ProtoJS.Test.Runner.addTestUnit( 
  ProtoJS.Test.extend( {
    getScope: function() { return "Canvas2D"; },

    test001RegisterShape: function test001RegisterShape() {
      var shape = Canvas2D.Shape.extend( {} );
      shape.MANIFEST = {
        name         : "testShape",
        aliasses     : [ "testAlias" ],
        properties   : { someProperty : new Canvas2D.Type() },
        libraries    : [ "Canvas2D" ]
      };

      Canvas2D.registerShape( shape );

      this.assertTrue( Canvas2D.shapes.hasKey( "testShape" ) );
      this.assertTrue( Canvas2D.shapes.hasKey( "testAlias" ) );
      this.assertTrue( Canvas2D.libraries.get("Canvas2D").contains(shape) );
      this.assertEqual( typeof shape.prototype.getSomeProperty, "function" );
      this.assertEqual( typeof shape.prototype.setSomeProperty, "function" );
    }

  } )
);
