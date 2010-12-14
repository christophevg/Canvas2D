ProtoJS.Test.Runner.addTestUnit( 
  ProtoJS.Test.extend( {
    getScope: function() { return "Widget"; },

    test001Generated: function test001Generated() {
      var generated = { value: "" };
      this.createDocumentMock( { generated: generated } );
      var book  = this.createSimpleBook();
      var sheet = book.addSheet();
      
      var shape = new Canvas2D.Rectangle({name:"mockRectangle"});
      sheet.at(10,10).put( shape );
      var position = sheet.getPosition(shape);
      position.move(15,25);

      this.assertEqual( generated.value, 
        "sheet newSheet0 {\n  [@25,35]\n  rectangle mockRectangle;\n}\n" );
    },
    
    test002Console: function test002Console() {
      var consoleElement = { value: "" };
      this.createDocumentMock( { console: consoleElement } );
      var book  = this.createSimpleBook();
      var sheet = book.addSheet();
      
      var shape = new Canvas2D.Rectangle({name:"mockRectangle"});
      sheet.at(10,10).put( shape );
      var position = sheet.getPosition(shape);
      position.move(15,25);
      position.move(25,35);

      this.assertEqual( consoleElement.value,
        "[mockBook] mockRectangle moved from 25,35 to 50,70\n" +
        "[mockBook] mockRectangle moved from 10,10 to 25,35\n" +
        "[mockBook] added new shape@10,10" );
    },
    
    createSimpleBook: function createSimpleBook() {
      return (new Canvas2D.Book("mockBook"))
             .renderImmediate()
             .setLogHeaderGenerator( function() { return null; } );
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
          "generated_for_mockBook" : elements.generated,
          "console_for_mockBook"   : elements.console
        },
        getElementById: function(id) { 
          return this.map[id];
        } 
      };
    }
  } )
);
