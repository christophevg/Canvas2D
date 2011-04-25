if( typeof Envjs == "undefined" ) { load( "lib/common.make/env.rhino.js" ); }
if( typeof Canvas2D == "undefined" ) { load( "build/Canvas2D.cli.js" ); }

function testADLRoundTrip(input, msg, expected ) {
  var output = "";
  var error  = null;
  msg        = msg || "";
  expected   = expected || input;

  try {
		var book = new Canvas2D.Book();
		book.load( input );
		// TODO: move this to Book?
		if( book.errors != "" ) { 
		  throw( { fileName: "Book", lineNumber: "load", message: book.errors } ); 
		}
		output = book.toADL();
  } catch(e) {
		error = "ERROR: " + e["fileName"] + "@" + e["lineNumber"] + " : " + 
					  e["message"];
  }

  if( error || output != expected ) {
    msg = "Expected :\n-->" + expected + "<--\nbut got :\n-->" + output + "<--\n" +
    ( error ? error + "\n" : "" ) + msg;
    return { result: false, info: msg };
  }

  return { result: true, info: "" };
}

ProtoJS.Test.Runner.test( testADLRoundTrip );
[ 
  "Shape",
  "Sheet", "Line", "LinePath", "Rectangle", "Text", "Image", "Arrow",
  "Annotations"
]
.iterate( function(shape) {
	eval( "var set = [ " + readFile( "t/syntax/test" + shape + ".js" ) + "];" );
	print( "Testing " + shape );
	ProtoJS.Test.Runner.using( set );
} );

print( "-----------------------" );
print( ProtoJS.Test.Runner.getResults().total   + " tests run." );
print( ProtoJS.Test.Runner.getResults().failed  + " failed." );
print();
