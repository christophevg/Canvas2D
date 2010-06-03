load("lib/jslint.js");

var fileName = arguments[0];
var src      = readFile(fileName);

JSLINT( src, { evil: true, forin: true } );

// All of the following are known issues that we think are 'ok'
// (in contradiction with JSLint) more information here:
// http://docs.jquery.com/JQuery_Core_Style_Guidelines
// and (soon) at http://umlcanvas.org/Development/Coding_Guidelines
var ok = {
  "Use '===' to compare with 'null'." : true,
  "Use '!==' to compare with 'null'." : true,
  "Expected a 'break' statement before 'case'." : true,
  "Expected a 'break' statement before 'default'." : true,
  "Reserved name '__proto__'." : true
};

var e = JSLINT.errors, found = 0, w;

for( var i = 0; i < e.length; i++ ) {
  w = e[i];

  if( !ok[ w.reason ] ) {
    print( "JSLint> " + fileName + " @ " + w.line + "," + w.character + ": " + 
    w.reason + "\n   " + w.evidence + "\n" );
  }
}
