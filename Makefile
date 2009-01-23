PROTOTYPE-DIST=prototype-1.6.0.3.js
EXCANVAS-DIST=excanvas_0002.zip
TABBER-DIST=tabber.zip

APP=Canvas2D
SRCS=src/${APP}.js src/Shape.js src/Rectangle.js src/Connector.js src/Visitor.js
CSSSRCS=lib/tabber/example.css src/${APP}.css
VERSION=0.0.1
LIBS=lib/${PROTOTYPE-DIST} \
     lib/excanvas/excanvas.js lib/canvastext.js \
     lib/adl/build/adl.js \
     lib/tabber/tabber.js
FETCH=wget -q
GIT-FETCH=git clone -q
UNZIP=unzip -q
UNTAR=tar -zxf

PROTOTYPE-URL=http://www.prototypejs.org/assets/2008/9/29/${PROTOTYPE-DIST}
EXCANVAS-URL=http://surfnet.dl.sourceforge.net/sourceforge/excanvas/
CANVASTEXT-URL=http://www.federated.com/~jim/canvastext/canvastext.js
ADL-URL=http://git.thesoftwarefactory.be/pub/adl.git
TABBER-URL=http://www.barelyfitz.com/projects/tabber/${TABBER-DIST}

DIST=${APP}-${VERSION}.tar.gz
DISTSRCS=build/${APP}.js build/${APP}.css examples/*.html LICENSE

DIST-SRC=${APP}-${VERSION}-src.tar.gz
DIST-SRCSRCS=LICENSE README examples Makefile doc src

PUB=moonbase:~/dist/

all: build ${RUNLIBS}

build: build/${APP}.js build/${APP}.css

dist: dist/${DIST} dist/${DIST-SRC}

lib/${PROTOTYPE-DIST}:
	@echo "*** importing $@"
	@mkdir -p lib
	@(cd lib; ${FETCH} ${PROTOTYPE-URL})

lib/excanvas/excanvas.js: 
	@echo "*** importing $@"
	@mkdir -p lib
	@(cd lib; ${FETCH} ${EXCANVAS-URL}/${EXCANVAS-DIST})
	@(cd lib; mkdir excanvas; cd excanvas; ${UNZIP} ../${EXCANVAS-DIST})

lib/canvastext.js:
	@echo "*** importing $@"
	@mkdir -p lib
	@(cd lib; ${FETCH} ${CANVASTEXT-URL} )

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

build/${APP}.js: ${SRCS} ${LIBS}
	@echo "*** building $@"
	@mkdir -p build
	@cat ${LIBS} ${SRCS} > $@

build/${APP}.css: ${CSSSRCS}
	@echo "*** building $@"
	@mkdir -p build
	@cat ${CSSSRCS} > $@

publish: dist/${DIST} dist/${DIST-SRC}
	@echo "*** publishing distributions to ${PUB}"
	@scp dist/${DIST} dist/${DIST-SRC} ${PUB}

dist/${DIST}: ${DISTSRCS}
	@echo "*** packaging ${APP}"
	@mkdir -p dist/js/${APP}/{examples,build}
	@for f in ${DISTSRCS}; do \
	    cat $$f | sed -e 's/\.\.\/build/../' > dist/js/${APP}/$$f; done
	@mv dist/js/${APP}/build/* dist/js/${APP}/; rm -rf dist/js/${APP}/build
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
