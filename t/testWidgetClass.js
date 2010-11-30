ProtoJS.Test.Runner.addTestUnit( 
  ProtoJS.Test.extend( {
    getScope: function() { return "Widget"; },

    test001Generated: function test001BookWithSheetAndShape() {
      var generated = { value: "" };
      this.createDocumentMock( { generated: generated } );
      var book  = this.createSimpleBook();
      var sheet = book.addSheet();
      
      var shape = new Canvas2D.Rectangle({name:"mockRectangle"});
      sheet.at(10,10).put( shape );
      var position = sheet.getPosition(shape);
      position.move(15,25);

      // we delay starting the book to this point, because we might run
      // into timing issues before ... will look into it later
      book.start();
      this.assertEqual( generated.value, 
        "sheet newSheet0 {\n  [@25,35]\n  rectangle mockRectangle;\n}\n" );
      book.stop();
    },
    
    createSimpleBook: function createSimpleBook() {
      return (new Canvas2D.Book("mockBook"))
             .setLogHeaderGenerator( function() { return ""; } );
    },
    
    createDocumentMock: function createDocumentMock(elements) {
      var canvas = {
        nodeType : 1,
        width: 0,
        height: 0,
        id: "mockBook",
        className : "",
        addEventListener : function() {},
      };
      var ctx = {
        canvas : canvas
      };
      canvas.getContext = function() { return ctx; }

      Canvas2D.Sheet.Properties.iterate( function(prop) {
        ctx[prop] = "";
      } );
      Canvas2D.Sheet.Operations.iterate( function(operation) {
        ctx[operation] = function() {};
      } );
      ctx.measureText = function() { return { width: 0 }; };

      document = { 
        addEventListener : function() {},
        map: {
          "mockBook" : canvas,
          "generated_for_mockBook" : elements.generated
        },
        getElementById: function(id) { 
          return this.map[id];
        } 
      };
    }
  } )
);
