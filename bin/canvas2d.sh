#!/bin/bash

if [ $# -lt 1 ]; then
  SCRIPT=-;
else
  SCRIPT=$1
fi

START_RUNNER=""
if [[ ${SCRIPT} =~ "t/api/test" ]]; then
  START_RUNNER="-f t/api/startTestRunner.js"
fi

java -jar lib/common.make/js.jar -w -debug  -opt -1 \
     -e "load( 'lib/common.make/env.rhino.js' );" \
     -e "load( 'build/Canvas2D.cli.js' );" \
     -e "print( 'Canvas2D-Shell' );" \
     -f ${SCRIPT} ${START_RUNNER}
