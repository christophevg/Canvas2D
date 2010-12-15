ProtoJS.Test.Runner.addTestUnit( 
  ProtoJS.Test.extend( {
    getScope: function() { return "Rectangle"; },

    test001RectangleDefaults: function test001RectangleDefaults() {
      var rect = new Canvas2D.Rectangle();
      
      this.assertEqual( rect.getWidth(), 50 );
      this.assertEqual( rect.getHeight(), 50 );
    }

  } )
);
