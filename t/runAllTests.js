load( "lib/common.make/env.rhino.js" );
load( "build/Canvas2D.cli.js" );

load( "t/testSyntax.js"    );	

print( "-----------------------" );
print( ProtoJS.Test.Runner.getResults().total   + " tests run." );
print( ProtoJS.Test.Runner.getResults().failed  + " failed." );
print();
