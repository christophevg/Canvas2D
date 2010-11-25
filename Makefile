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
			${SRC_DIR}/ShapeFactory.js \
			${SRC_DIR}/KickStart.js

SHAPE_SRCS = ${SRC_DIR}/Line.js \
     		 ${SRC_DIR}/LinePath.js \
     		 ${SRC_DIR}/Alias.js \
     		 ${SRC_DIR}/Rectangle.js \
     		 ${SRC_DIR}/Text.js \
     		 ${SRC_DIR}/Image.js \
     		 ${SRC_DIR}/Arrow.js

PLUGIN_SRCS = ${SRC_DIR}/plugins/DynamicSheet/DynamicSheet.js \
			  ${SRC_DIR}/plugins/DynamicSheet/Selection.js \
			  ${SRC_DIR}/plugins/DynamicSheet/Overlay.js \
			  ${SRC_DIR}/plugins/DynamicSheet/Marker.js \
			  ${SRC_DIR}/plugins/DynamicSheet/Box.js \
			  ${SRC_DIR}/plugins/DynamicSheet/Border.js \
			  ${SRC_DIR}/plugins/DynamicSheet/Position.js \
			  ${SRC_DIR}/plugins/DynamicSheet/Group.js \
			  ${SRC_DIR}/plugins/Splash.js \
			  ${SRC_DIR}/plugins/Widget.js \
			  ${SRC_DIR}/plugins/TabbedCanvas.js \
     		${SRC_DIR}/plugins/AutoLayout.js \
     		${SRC_DIR}/plugins/Watermark.js \
     		${SRC_DIR}/plugins/KeyboardStatus.js

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
