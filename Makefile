APP=Canvas2D
SRCS=src/${APP}.js
VERSION=0.0.1
LIBS=lib/prototype.js lib/excanvas.js lib/canvastext.js lib/adl.js

FETCH=wget -q
GIT-FETCH=git clone -q
UNZIP=unzip -q
UNTAR=tar -zxf

PROTOTYPE-DIST=prototype-1.6.0.3.js
PROTOTYPE-URL=http://www.prototypejs.org/assets/2008/9/29/${PROTOTYPE-DIST}

EXCANVAS-URL=http://surfnet.dl.sourceforge.net/sourceforge/excanvas/
EXCANVAS-DIST=excanvas_0002.zip

CANVASTEXT-URL=http://www.federated.com/~jim/canvastext/canvastext.js

ADL-URL=http://git.thesoftwarefactory.be/pub/adl.git

DIST=${APP}-${VERSION}.tar.gz
DISTSRCS=build/${APP}.js examples LICENSE

DIST-SRC=${APP}-${VERSION}-src.tar.gz
DIST-SRCSRCS=LICENSE README examples Makefile doc src

PUB=moonbase:~/dist/

all: build ${RUNLIBS}

build: build/${APP}.js

dist: dist/${DIST} dist/${DIST-SRC}

lib/prototype.js: lib/${PROTOTYPE-DIST}
	@echo "*** importing $@"
	@cp $< $@

lib/${PROTOTYPE-DIST}:
	@echo "*** fetching prototype dist"
	@mkdir -p lib
	@(cd lib; ${FETCH} ${PROTOTYPE-URL})

lib/excanvas.js: lib/excanvas
	@echo "*** importing excanvas.js"
	@cp lib/excanvas/excanvas.js $@

lib/excanvas: lib/${EXCANVAS-DIST}
	@echo "*** unpacing excanvas dist"
	@(cd lib; mkdir excanvas; cd excanvas; ${UNZIP} ../${EXCANVAS-DIST})

lib/${EXCANVAS-DIST}:
	@echo "*** fetching excanvas dist"
	@(cd lib; ${FETCH} ${EXCANVAS-URL}/${EXCANVAS-DIST})

lib/canvastext.js:
	@echo "*** fetching canvastext.js"
	@(cd lib; ${FETCH} ${CANVASTEXT-URL} )

lib/adl.js: lib/adl
	@echo "*** importing $@"
	@cp lib/adl/build/adl.js $@

lib/adl:
	@echo "*** cloning adl repository"
	@${GIT-FETCH} ${ADL-URL} $@
	@(cd lib/adl; make)

build/${APP}.js: ${SRCS} ${LIBS}
	@echo "*** building Canvas2D"
	@mkdir -p build
	@cat ${LIBS} ${SRCS} > $@

publish: dist/${DIST} dist/${DIST-SRC}
	@echo "*** publishing distributions to ${PUB}"
	@scp dist/${DIST} dist/${DIST-SRC} ${PUB}

dist/${DIST}: ${DISTSRCS}
	@echo "*** packaging ${APP}"
	@mkdir -p dist/js/${APP}
	@cp -r ${DISTSRCS} dist/js/${APP}
	@(cd dist/js; tar -zcf ../${DIST} ${APP})

dist/${DIST-SRC}: 
	@echo "*** packaging src distribution"
	@mkdir -p dist/src/${APP}
	@cp -r ${DIST-SRCSRCS} dist/src/${APP}
	@(cd dist/src; tar -zcf ../${DIST-SRC} ${APP})

clean:
	@find . | grep "~$$" | xargs rm
	@rm -rf build dist

mrproper: clean
	@rm -rf lib
