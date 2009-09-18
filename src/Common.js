function unless( stmt, func ) {
    if( ! stmt ) { func(); }
}

function max(a,b) {
    return a < b ? b : a;
}

function min(a,b) {
    return a < b ? a : b;
}

// IE misses indexOf ... and so do we ;-)
if(!Array.indexOf) {
    Array.prototype.indexOf = function(obj){
	for(var i=0; i<this.length; i++){
	    if(this[i]==obj){
	        return i;
	    }
	}
	return -1;
    }
}

Array.prototype.contains = function(substring) {
    return this.indexOf(substring) > -1;
};

/**
 * Provides the size specified in the given font specifier
 * @param {DOMString} font a CSS font specifier
 * @return the size of the font, in pixels
 */
 function getFontSize(font) {
     var size = null;
     size = toPx(font, "px");
     if (size == null) {
	 size = toPx(font, "pt");
	 if (size == null) {
	     size = toPx(font, "em");
	     if (size == null) {
		 size = toPx(font, "pct");
		 if (size != null) {
		     return size;
		 }
	     } else {
		 return size;
	     }
	 } else {
	     return size;
	 }
     } else {
	 return size;
     }
     
     throw("cannot get size from font specifier: " + font);
}

function toPx(font, src) {
    if(!font) {
	console.log( "Common::toPx: require a valid font. Got: '" + font + "'");
	return;
    }

    /* 
     * if font size is expressed in points, ems or percentages,
     * then it is converted to pixels approximately, using the table on 
     * http://www.reeddesign.co.uk/test/points-pixels.html
     */
    var conversionTable = [
	{"pt":5.5,	"px":6, 	"em":0.375,	"pct":37.5},
	{"pt":6,	"px":8, 	"em":0.5,	"pct":50},
	{"pt":7,	"px":9,		"em":0.55,	"pct":55},
	{"pt":7.5,	"px":10,	"em":0.625,	"pct":62.5},
	{"pt":8,	"px":11,	"em":0.7,	"pct":70},
	{"pt":9,	"px":12,	"em":0.75,	"pct":75},
	{"pt":10,	"px":13,	"em":0.8,	"pct":80},
	{"pt":10.5,	"px":14,	"em":0.875,	"pct":87.5},
	{"pt":11,	"px":15,	"em":0.95,	"pct":95},
	{"pt":12,	"px":16,	"em":1,		"pct":100},
	{"pt":13,	"px":17,	"em":1.05,	"pct":105},
	{"pt":13.5,	"px":18,	"em":1.125,	"pct":112.5},
	{"pt":14,	"px":19,	"em":1.2,	"pct":120},
	{"pt":14.5,	"px":20,	"em":1.25,	"pct":125},
	{"pt":15,	"px":21,	"em":1.3,	"pct":130},
	{"pt":16,	"px":22,	"em":1.4,	"pct":140},
	{"pt":17,	"px":23,	"em":1.45,	"pct":145},
	{"pt":18,	"px":24,	"em":1.5,	"pct":150},
	{"pt":20,	"px":26,	"em":1.6,	"pct":160},
	{"pt":22,	"px":29,	"em":1.8,	"pct":180},
	{"pt":24,	"px":32,	"em":2,		"pct":200},
	{"pt":26,	"px":35,	"em":2.2,	"pct":220},
	{"pt":27,	"px":36,	"em":2.25,	"pct":225},
	{"pt":28,	"px":37,	"em":2.3,	"pct":230},
	{"pt":29,	"px":38,	"em":2.35,	"pct":235},
	{"pt":30,	"px":40,	"em":2.45,	"pct":245},
	{"pt":32,	"px":42,	"em":2.55,	"pct":255},
	{"pt":34,	"px":45,	"em":2.75,	"pct":275},
	{"pt":36,	"px":48,	"em":3,		"pct":300}
    ];
    
    var result = font.match("(\\d+)"+src+"\\s*/");
    if (result == null) {
	result = font.match("(\\d+)"+src+"\\s*");
	if (result != null) {
	    result = result[1];
	}
    } else {
	result = result[1];
    }
    if (result != null) {
	for (var i = 0; i < conversionTable.length; i++) {
	    if (conversionTable[i][src] == result) {
		return conversionTable[i]["px"];
	    }
	}
    }
    
    return null;
}

function Timer() {
    this.now = new Date().getTime();
    this.stop = function() {
	return new Date().getTime() - this.now;
    }
}
