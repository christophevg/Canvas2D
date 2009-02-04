PROTOTYPE-DIST=prototype-1.6.0.3.js
TABBER-DIST=tabber.zip
COMPRESSOR-VERSION=2.4.2
COMPRESSOR-DIST=yuicompressor-${COMPRESSOR-VERSION}.zip
COMPRESS-JAR=lib/yuicompressor-${COMPRESSOR-VERSION}/build/yuicompressor-${COMPRESSOR-VERSION}.jar

FETCH=wget -q
GIT-FETCH=git clone -q
ZIP=zip -qr
UNZIP=unzip -q
UNTAR=tar -zxf
COMPRESS=java -jar ${COMPRESS-JAR} --type js
PATCH=patch -N -s

APP=Canvas2D
TARGETS=build/${APP}.shared.min.js build/${APP}.standalone.min.js \
        build/${APP}.css 
SRCS=src/SanityChecks.js \
     src/Canvas.js \
     src/ADLVisitor.js \
     src/Sheet.js \
     src/Shape.js src/Rectangle.js src/Connector.js \
     src/KickStart.js
CSSSRCS=lib/tabber/example.css src/${APP}.css
VERSION=$(shell git describe --tags | cut -d'-' -f1,2)
LIBS=lib/${PROTOTYPE-DIST} \
     lib/excanvas.js lib/canvastext.js \
     lib/adl/build/adl.js \
     lib/tabber/tabber.js

PROTOTYPE-URL=http://www.prototypejs.org/assets/2008/9/29/${PROTOTYPE-DIST}
EXCANVAS-URL=http://excanvas.svn.sourceforge.net/viewvc/excanvas/excanvas.js
CANVASTEXT-URL=http://www.federated.com/~jim/canvastext/canvastext.js
ADL-URL=http://git.thesoftwarefactory.be/pub/ADL.git
TABBER-URL=http://www.barelyfitz.com/projects/tabber/${TABBER-DIST}

COMPRESSOR-URL=http://www.julienlecomte.net/yuicompressor/${COMPRESSOR-DIST}

DIST=${APP}-${VERSION}.zip
DISTSRCS=${TARGETS} examples/*.html LICENSE README

DIST-SRC=${APP}-${VERSION}-src.zip
DIST-SRCSRCS=LICENSE README examples Makefile doc src

DIST-EXT=${APP}-${VERSION}-ext.zip
DIST-EXTSRCS=LICENSE build/${APP}.standalone.min.js build/${APP}.css \
             src/ext/${APP}.php

PUB=moonbase:~/dist/

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

lib/${PROTOTYPE-DIST}:
	@echo "*** importing $@"
	@mkdir -p lib
	@(cd lib; ${FETCH} ${PROTOTYPE-URL})

lib/excanvas.js: 
	@echo "*** importing $@"
	@mkdir -p lib
	@(cd lib; ${FETCH} ${EXCANVAS-URL})

lib/canvastext.js:
	@echo "*** importing $@"
	@mkdir -p lib
	@(cd lib; ${FETCH} ${CANVASTEXT-URL}; \
                  ${PATCH} <../patches/canvastext.diff )

lib/adl/build/adl.js:
	@echo "*** importing $@"
	@${GIT-FETCH} ${ADL-URL} lib/adl
	@(cd lib/adl; make)

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

publish: dist/${DIST} dist/${DIST-SRC} dist/${DIST-EXT}
	@echo "*** publishing distributions to ${PUB}"
	@scp dist/${DIST} dist/${DIST-SRC} dist/${DIST-EXT} ${PUB}

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
