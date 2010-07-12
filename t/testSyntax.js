function parseADL(input, msg, expected ) {
  var output = "";
  var error  = null;
  msg        = msg || "";
  expected   = expected || input;

  try {
		var book = new Canvas2D.Book();
		book.load( input );
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

ProtoJS.Test.Runner.test( parseADL ).using(
  [ 
  { 
    name     : "001",
    data     : "sheet mySheet;\n",
    expected : true 
  }
  ] 
);
