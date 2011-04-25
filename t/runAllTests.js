load( "lib/common.make/env.rhino.js" );
load( "build/Canvas2D.cli.js" );

ProtoJS.Debug = true;

print( "Testing Syntax" );
print( "-----------------------" );
load( "t/syntax/runAllTests.js" );

print( "Testing API" );
print( "-----------------------" );
load( "t/api/runAllTests.js" );
