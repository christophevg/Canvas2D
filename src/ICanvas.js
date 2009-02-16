// Interface definition of the HTML5 spec for the CanvasRenderingContext2D
// implemented as an abstract class
Canvas2D.ICanvas = Class.create( {
    save    : function() {}, // push state on state stack
    restore : function() {}, // pop state stack and restore state

    // transformations (default transform is the identity matrix)
    scale        : function(x,y) {},
    rotate       : function(angle) {},
    translate    : function(x, y) {},
    transform    : function(m11, m12, m21, m22, dx, dy) {},
    setTransform : function(m11, m12, m21, m22, dx, dy) {},

    // compositing
    globalAlpha              : 1.0,
    globalCompositeOperation : "source-over",
    
    // colors and styles
    strokeStyle : "black", 
    fillStyle   : "black",  
    createLinearGradient : function(x0, y0, x1, y1)         { return null; },
    createRadialGradient : function(x0, y0, r0, x1, y1, r1) { return null; },
    createPattern        : function(image, repetition)      { return null; },
    
    // line caps/joins
    lineWidth  : 1,
    lineCap    : "butt",  // "butt", "round", "square"
    lineJoin   : "miter", // "round", "bevel", "miter"
    miterLimit : 10,
    
    // shadows
    shadowOffsetX : 0,
    shadowOffsetY : 0,
    shadowBlur    : 0,
    shadowColor   : "rgba(0,0,0,1)", // (default transparent black)
    
    // rects
    clearRect  : function(x, y, w, h) {},
    fillRect   : function(x, y, w, h) {},
    strokeRect : function(x, y, w, h) {},
    
    // path API
    beginPath        : function() {},
    closePath        : function() {},
    moveTo           : function(x, y) {},
    lineTo           : function(x, y) {},
    quadraticCurveTo : function(cpx, cpy, x, y) {},
    bezierCurveTo    : function(cp1x, cp1y, cp2x, cp2y, x, y) {},
    arcTo            : function(x1, y1, x2, y2, radius) {},
    rect             : function(x, y, w, h) {},
    arc              : function(x, y, radius, startAng, endAng, anticlockw) {},
    fill             : function() {},
    stroke           : function() {},
    clip             : function() {},
    isPointInPath    : function(x, y) {},

    // text
    font         : "10px sans-serif",
    textAlign    : "start", // "start", "end", "left", "right", "center"
    textBaseline : "alphabetic",  // "top", "hanging", "middle", 
                                  // "alphabetic", "ideographic", "bottom"
    fillText     : function(text, x, y, maxWidth) {},
    strokeText   : function(text, x, y, maxWidth) {},
    measureText  : function(text) { return null; },

    // drawing images
    drawImage : function(image, sx, sy, sw, sh, dx, dy, dw, dh) {},

    // pixel manipulation
    createImageData : function(sw, sh)         { return null; },
    getImageData    : function(sx, sy, sw, sh) { return null; },
    putImageData    : function(imagedata, dx, dy, 
			       dirtyX, dirtyY, dirtyWidth, dirtyHeight) {}
} );
