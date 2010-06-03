SRC_DIR   = src
LIB_DIR   = lib
BUILD_DIR = build
DIST_DIR  = dist

MAKE      = make
ZIP       = zip -qr
RHINO     = java -jar lib/js.jar
COMPRESS  = java -jar lib/yuicompressor-2.4.2.jar --type js

APP       = Canvas2D

CORE_SRCS = ${SRC_DIR}/IEFixes.js \
			${SRC_DIR}/Common.js \
			${SRC_DIR}/Canvas2D.js \
			${SRC_DIR}/Factory.js \
			${SRC_DIR}/Keyboard.js \
			${SRC_DIR}/ImageManager.js \
			${SRC_DIR}/Manager.js \
			${SRC_DIR}/ADLVisitor.js \
			${SRC_DIR}/TypeFactory.js \
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

PLUGIN_SRCS = ${SRC_DIR}/plugins/TabbedCanvas.js \
     		  ${SRC_DIR}/plugins/AutoLayout.js \
     		  ${SRC_DIR}/plugins/Watermark.js

SHARED_EXTRA_SRCS = ${SRC_DIR}/SanityChecks.js

SRCS=${CORE_SRCS} ${SHAPE_SRCS} ${PLUGIN_SRCS}

STANDALONE_SRCS = ${SRCS}
SHARED_SRCS     = ${SHARED_EXTRA_SRCS} ${SRCS}

VERSION = $(shell git describe --tags | cut -d'-' -f1,2)

LIBS = ${LIB_DIR}/ProtoJS/build/ProtoJS.js \
       ${LIB_DIR}/ADL/build/ADL.shared.js \
       ${LIB_DIR}/excanvas.js \
	   ${LIB_DIR}/canvastext.js \
	   ${LIB_DIR}/tabber.js

DIST          = ${APP}-${VERSION}.zip
DIST_SRCS     = LICENSE README ${TARGETS} examples

DIST-SRC      = ${APP}-${VERSION}-src.zip
DIST-SRC_SRCS = LICENSE README Makefile ${SRC_DIR} ${LIB_DIR} examples

DIST-EXT      = ${APP}-${VERSION}-ext.zip
DIST-EXT_SRCS = LICENSE ${BUILD_DIR}/${APP}.standalone.min.js \
				src/ext/${APP}.php examples/Canvas2D.css

TARGETS   = ${BUILD_DIR}/${APP}.shared.min.js \
		    ${BUILD_DIR}/${APP}.standalone.min.js

DIST_TARGETS = ${DIST_DIR}/${DIST} \
			   ${DIST_DIR}/${DIST-SRC} \
			   ${DIST_DIR}/${DIST-EXT}

all: prepare ${TARGETS}

dist: prepare ${DIST_TARGETS}

prepare: init check-deps 

init:
	@git submodule init
	@git submodule update

check-deps:
	@which zip >/dev/null  || ( echo "ERROR: missing  : zip"; exit 1 )
	@which git >/dev/null  || ( echo "ERROR: missing : git"; exit 1 )
	@which java >/dev/null || ( echo "ERROR: missing : java"; exit 1 )

update:
	@(cd lib/ADL; ${MAKE} clean; ${MAKE})
	@(cd lib/ProtoJS; ${MAKE} clean; ${MAKE})

${BUILD_DIR}:
	@mkdir  -p ${BUILD_DIR}

${BUILD_DIR}/${APP}.shared.js: ${BUILD_DIR} ${SHARED_SRCS}
	@echo "*** building $@"
	@cat ${SHARED_SRCS} > $@
	@echo "\nCanvas2D.version = \"${VERSION}\";\n" >> $@;

${BUILD_DIR}/${APP}.standalone.js: ${BUILD_DIR} ${LIBS} ${STANDALONE_SRCS}
	@echo "*** building $@"
	@cat ${LIBS} ${STANDALONE_SRCS} > $@
	@echo "\nCanvas2D.version = \"${VERSION}\";\n" >> $@;

${BUILD_DIR}/${APP}.shared.min.js: ${BUILD_DIR}/${APP}.shared.js
	@echo "*** building $@"
	@${COMPRESS} ${BUILD_DIR}/${APP}.shared.js > $@

${BUILD_DIR}/${APP}.standalone.min.js: ${BUILD_DIR}/${APP}.standalone.js
	@echo "*** building $@"
	@${COMPRESS} ${BUILD_DIR}/${APP}.standalone.js > $@

${DIST_DIR}/${DIST}: ${DIST_SRCS}
	@echo "*** packaging ${APP} distribution"
	@mkdir -p ${DIST_DIR}/js/${APP}
	@cp -r ${DIST_SRCS} ${DIST_DIR}/js/${APP}/
	@( cd ${DIST_DIR}/js/${APP}/examples; \
	   for f in *.html; do \
		cat $$f \
		| sed -e 's/includes\.js/..\/Canvas2D.standalone.min.js/' \
		| sed -e 's/..\/build\///' > \
		$$f.new; \
		mv $$f.new $$f; \
	done )
	@(cd ${DIST_DIR}/js; ${ZIP} ../${DIST} ${APP})

${DIST_DIR}/${DIST-SRC}: ${DIST-SRC_SRCS}
	@echo "*** packaging ${APP} src distribution"
	@mkdir -p ${DIST_DIR}/src/${APP}
	@cp -r ${DIST-SRC_SRCS} ${DIST_DIR}/src/${APP}
	@(cd ${DIST_DIR}/src; ${ZIP} ../${DIST-SRC} ${APP})

dist/${DIST-EXT}: ${DIST-EXT_SRCS}
	@echo "*** packaging ${APP} Mediawiki extenstion"
	@mkdir -p ${DIST_DIR}/ext/${APP}
	@cp -r ${DIST-EXT_SRCS} ${DIST_DIR}/ext/${APP}
	@(cd ${DIST_DIR}/ext; ${ZIP} ../${DIST-EXT} ${APP})

clean:
	@find . | grep "~$$" | xargs rm -f
	@rm -rf ${DIST_DIR}

mrproper: clean
	@rm -rf ${BUILD_DIR} 