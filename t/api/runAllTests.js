if( typeof Envjs == "undefined" ) { load( "lib/common.make/env.rhino.js" ); }
if( typeof Canvas2D == "undefined" ) { load( "build/Canvas2D.cli.js" ); }

[
  "Canvas2D", "Rectangle", "Widget"
].iterate( function( unit ) {
  load( "t/api/test" + unit + ".js"    );
} );

function showResults(tester) {
  print( "-----------------------" );
  print( tester.getResults().total   + " tests run." );
  print( tester.getResults().failed  + " failed." );
  print();
}

ProtoJS.Test.Runner.on( "ready", showResults );
ProtoJS.Test.Runner.start();
