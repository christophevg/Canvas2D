EXCANVAS-AG=http://excanvas.svn.sourceforge.net/viewvc/excanvas/silverlight/excanvas.js
EXCANVAS-URL=http://explorercanvas.googlecode.com/svn/trunk/excanvas.js
CANVASTEXT-URL=../local/canvastext.js
ADL-URL=http://github.com/christophevg/ADL.git
PROTOJS-URL=http://github.com/christophevg/ProtoJS.git
TABBER-DIST=tabber.zip
TABBER-URL=http://www.barelyfitz.com/projects/tabber/${TABBER-DIST}

COMPRESSOR-VERSION=2.4.2
COMPRESSOR-DIST=yuicompressor-${COMPRESSOR-VERSION}.zip
COMPRESSOR-URL=http://www.julienlecomte.net/yuicompressor/${COMPRESSOR-DIST}
COMPRESS-JAR=lib/yuicompressor-${COMPRESSOR-VERSION}/build/yuicompressor-${COMPRESSOR-VERSION}.jar

MAKE=make
FETCH=wget -q
GIT-PULL=git pull -q
GIT-CLONE=git clone -q
ZIP=zip -qr
UNZIP=unzip -q
UNTAR=tar -zxf
COMPRESS=java -jar ${COMPRESS-JAR} --type js
PATCH=patch -N -s

APP=Canvas2D
TARGETS=build/${APP}.shared.min.js \
        build/${APP}.standalone.min.js \
        build/${APP}.css 
SRCS=src/IEFixes.js \
     src/DepCheck.js \
     src/SanityChecks.js \
     src/Common.js \
     src/Canvas2D.js \
     src/Factory.js \
     src/Keyboard.js \
     src/ImageManager.js \
     src/Manager.js \
     src/ADLVisitor.js \
     src/Book.js \
     src/Shape.js \
     src/Sheet.js \
     src/Position.js \
     src/Connector.js \
     src/Line.js \
     src/LinePath.js \
     src/Alias.js \
     src/CompositeShape.js \
     src/Compositor.Stack.js \
     src/Rectangle.js \
     src/Text.js \
     src/Image.js \
     src/Arrow.js \
     src/plugins/TabbedCanvas.js \
     src/plugins/AutoLayout.js \
     src/plugins/Watermark.js \
     src/KickStart.js \
     src/Defaults.js
CSSSRCS=lib/tabber/example.css src/${APP}.css
VERSION=$(shell git describe --tags | cut -d'-' -f1,2)
LIBS=lib/ProtoJS/build/ProtoJS.js \
     lib/excanvas.js lib/canvastext.js \
     lib/ADL/build/ADL.shared.js \
     lib/tabber/tabber.js

DIST=${APP}-${VERSION}.zip
DISTSRCS=${TARGETS} examples/*.html LICENSE README

DIST-SRC=${APP}-${VERSION}-src.zip
DIST-SRCSRCS=LICENSE README examples Makefile doc src

DIST-EXT=${APP}-${VERSION}-ext.zip
DIST-EXTSRCS=LICENSE build/${APP}.standalone.min.js build/${APP}.css \
             src/ext/${APP}.php

all: build

build: .check-deps ${TARGETS}

.check-deps:
	@echo "*** checking dependencies"
	@echo "    (if you get errors in this section the cmd right before"
	@echo "     the error, is not found in your PATH)"
	@echo "    - zip"; which zip >/dev/null
	@echo "    - touch"; which touch >/dev/null
	@echo "    - unzip"; which unzip >/dev/null
	@echo "    - wget";  which wget >/dev/null
	@echo "    - git"; which git >/dev/null
	@echo "    - patch"; which patch >/dev/null
	@echo "    - java";  which java >/dev/null
	@echo "*** FOUND all required commands on your system"
	@touch $@

dist: dist/${DIST} dist/${DIST-SRC} dist/${DIST-EXT}

update-libs:
	@(cd lib/ADL; ${GIT-PULL}; ${MAKE} clean; ${MAKE})
	@(cd lib/ProtoJS; ${GIT-PULL}; ${MAKE} clean; ${MAKE})

lib/excanvas.js: 
	@echo "*** importing $@"
	@mkdir -p lib
	@(cd lib; ${FETCH} ${EXCANVAS-URL})

lib/canvastext.js:
	@echo "*** importing cached $@"
	@mkdir -p lib
	@(cd lib; cp ${CANVASTEXT-URL} .; )

lib/ProtoJS/build/ProtoJS.js:
	@echo "*** importing $@"
	@(cd lib; ${GIT-CLONE} ${PROTOJS-URL})
	@(cd lib/ProtoJS; ${MAKE})

lib/ADL/build/ADL.shared.js:
	@echo "*** importing $@"
	@(cd lib; ${GIT-CLONE} ${ADL-URL})
	@(cd lib/ADL; ${MAKE})

lib/tabber/tabber.js: lib/tabber
lib/tabber/tabber.css: lib/tabber

lib/tabber:
	@echo "*** importing Tabber"
	@mkdir -p lib
	@(cd lib; ${FETCH} ${TABBER-URL})
	@(cd lib; mkdir tabber; cd tabber; ${UNZIP} ../${TABBER-DIST})

${COMPRESS-JAR}:
	@echo "*** importing yuicompressor"
	@mkdir -p lib
	@(cd lib; ${FETCH} ${COMPRESSOR-URL}; ${UNZIP} ${COMPRESSOR-DIST})
	@(cd lib/yuicompressor-${COMPRESSOR-VERSION}; ant > /dev/null)

build/${APP}.shared.js: ${SRCS}
	@echo "*** building $@"
	@mkdir -p build
	@cat ${SRCS} > $@
	@echo "\nCanvas2D.version = \"${VERSION}\";\n" >> $@;

build/${APP}.standalone.js: build/${APP}.shared.js ${LIBS}
	@echo "*** building $@"
	@mkdir -p build
	@cat ${LIBS} build/${APP}.shared.js > $@

build/${APP}.shared.min.js: build/${APP}.shared.js ${COMPRESS-JAR}
	@echo "*** building $@"
	@${COMPRESS} build/${APP}.shared.js > $@

build/${APP}.standalone.min.js: build/${APP}.standalone.js ${COMPRESS-JAR}
	@echo "*** building $@"
	@${COMPRESS} build/${APP}.standalone.js > $@

build/${APP}.css: ${CSSSRCS}
	@echo "*** building $@"
	@mkdir -p build
	@cat ${CSSSRCS} > $@

dist/${DIST}: ${DISTSRCS}
	@echo "*** packaging ${APP} distribution"
	@mkdir -p dist/js/${APP}/{examples,build}
	@for f in ${DISTSRCS}; do \
	    cat $$f | sed -e 's/\.\.\/build/../' > dist/js/${APP}/$$f; done
	@mv dist/js/${APP}/build/* dist/js/${APP}/; rm -rf dist/js/${APP}/build
	@(cd dist/js; ${ZIP} ../${DIST} ${APP})

dist/${DIST-SRC}: ${DIST-SRCSRCS}
	@echo "*** packaging ${APP} src distribution"
	@mkdir -p dist/src/${APP}
	@cp -r ${DIST-SRCSRCS} dist/src/${APP}
	@(cd dist/src; ${ZIP} ../${DIST-SRC} ${APP})

dist/${DIST-EXT}: ${DIST-EXTSRCS}
	@echo "*** packaging ${APP} Mediawiki extenstion"
	@mkdir -p dist/ext/${APP}
	@cp -r ${DIST-EXTSRCS} dist/ext/${APP}
	@(cd dist/ext; ${ZIP} ../${DIST-EXT} ${APP})

clean:
	@find . | grep "~$$" | xargs rm -f
	@rm -f lib/*.rej
	@rm -rf build dist

mrproper: clean
	@rm -rf lib
