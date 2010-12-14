APP = Canvas2D

CORE_EXTRA_SRCS = ${SRC_DIR}/Canvas2D.css.js

CORE_SRCS = ${SRC_DIR}/Canvas2D.js \
			${SRC_DIR}/Factory.js \
			${SRC_DIR}/Keyboard.js \
			${SRC_DIR}/ImageManager.js \
			${SRC_DIR}/Manager.js \
			${SRC_DIR}/ADLVisitor.js \
			${SRC_DIR}/Type.js \
			${SRC_DIR}/Types.js \
			${SRC_DIR}/Book.js \
			${SRC_DIR}/Shape.js \
			${SRC_DIR}/Sheet.js \
			${SRC_DIR}/Position.js \
			${SRC_DIR}/Connector.js \
			${SRC_DIR}/Alias.js \
			${SRC_DIR}/ShapeFactory.js \
			${SRC_DIR}/KickStart.js

SHAPES_DIR=${SRC_DIR}/shapes

SHAPE_SRCS = ${SHAPES_DIR}/Line.js \
     		 ${SHAPES_DIR}/LinePath.js \
     		 ${SHAPES_DIR}/Rectangle.js \
     		 ${SHAPES_DIR}/Text.js \
     		 ${SHAPES_DIR}/Image.js \
     		 ${SHAPES_DIR}/Arrow.js \
				 ${SHAPES_DIR}/Circle.js

PLUGINS_DIR=${SRC_DIR}/plugins

PLUGIN_SRCS = ${PLUGINS_DIR}/DynamicSheet/DynamicSheet.js \
			  ${PLUGINS_DIR}/DynamicSheet/Selection.js \
			  ${PLUGINS_DIR}/DynamicSheet/Overlay.js \
			  ${PLUGINS_DIR}/DynamicSheet/Marker.js \
			  ${PLUGINS_DIR}/DynamicSheet/Box.js \
			  ${PLUGINS_DIR}/DynamicSheet/Border.js \
			  ${PLUGINS_DIR}/DynamicSheet/Position.js \
			  ${PLUGINS_DIR}/DynamicSheet/Group.js \
			  ${PLUGINS_DIR}/Splash.js \
			  ${PLUGINS_DIR}/Widget.js \
			  ${PLUGINS_DIR}/TabbedCanvas.js \
     		${PLUGINS_DIR}/AutoLayout.js \
     		${PLUGINS_DIR}/Watermark.js \
     		${PLUGINS_DIR}/KeyboardStatus.js

SHARED_EXTRA_SRCS = ${SRC_DIR}/SanityChecks.js

SRCS=${CORE_EXTRA_SRCS} ${CORE_SRCS} ${SHAPE_SRCS} ${PLUGIN_SRCS}

LIBS = ${LIB_DIR}/ProtoJS/build/ProtoJS.js \
       ${LIB_DIR}/ADL/build/ADL.shared.js \
       ${LIB_DIR}/excanvas.js \
	     ${LIB_DIR}/canvastext.js \
	     ${LIB_DIR}/tabber.js

UPDATE_LIBS = ${LIB_DIR}/ADL ${LIB_DIR}/ProtoJS

#############################################################################
# boilerplate to kickstart common.make

have-common := $(wildcard lib/common.make/Makefile.inc)
ifeq ($(strip $(have-common)),)
all:
	@echo "*** one-time initialization of common.make"
	@git submodule -q init
	@git submodule -q update
	@$(MAKE) -s $@
endif

-include lib/common.make/Makefile.inc

#############################################################################
# add the Mediawiki extension

MORE_DIST_TARGETS = ${DIST_DIR}/${DIST-EXT}

DIST-EXT      = ${APP}-${VERSION}-ext.zip
DIST-EXT_SRCS = LICENSE ${BUILD_DIR}/${APP}.standalone.min.js \
                src/ext/${APP}.php

dist/${DIST-EXT}: ${DIST-EXT_SRCS}
	@echo "*** packaging ${APP} Mediawiki extenstion"
	@mkdir -p ${DIST_DIR}/ext/${APP}
	@cp -r ${DIST-EXT_SRCS} ${DIST_DIR}/ext/${APP}
	@(cd ${DIST_DIR}/ext; ${ZIP} ../${DIST-EXT} ${APP})

JSEXEC   = ${RHINO} -w -debug

CLI_LIBS = ${LIB_DIR}/ProtoJS/build/ProtoJS.js \
	         ${LIB_DIR}/ADL/build/ADL.shared.js

CORE_SRCS = ${SRC_DIR}/Common.js \
			${SRC_DIR}/Canvas2D.js \
			${SRC_DIR}/Factory.js \
			${SRC_DIR}/Keyboard.js \
			${SRC_DIR}/ImageManager.js \
			${SRC_DIR}/Manager.js \
			${SRC_DIR}/ADLVisitor.js \
			${SRC_DIR}/Type.js \
			${SRC_DIR}/Types.js \
			${SRC_DIR}/Book.js \
			${SRC_DIR}/Shape.js \
			${SRC_DIR}/Sheet.js \
			${SRC_DIR}/Position.js \
			${SRC_DIR}/Connector.js \
			${SRC_DIR}/ShapeFactory.js

CLI_SRCS = ${CORE_SRCS} ${SHAPE_SRCS} ${PLUGIN_SRCS}

test-case: bin/canvas2d.sh build/Canvas2D.cli.js ${TESTCASE}
	bin/canvas2d.sh ${TESTCASE}
