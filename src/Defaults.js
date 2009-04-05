Canvas2D.Defaults = {};

Canvas2D.Defaults.Canvas = {
    lineWidth      : 1,   
    noCrispLines   : false,
    lineStyle      : "solid",
    strokeStyle    : "black", 
    fillStyle      : "black", 
    font           : "10pt Sans-Serif", 
    textAlign      : "left", 
    textBaseline   : "alphabetic",
    textDecoration : "none"    
};

Canvas2D.Defaults.Sheet = { 
    lineWidth      : 1,   
    lineStyle      : "solid",
    strokeStyle    : "black", 
    fillStyle      : "black", 
    font           : "10pt Sans-Serif", 
    textAlign      : "left", 
    textBaseline   : "alphabetic",
    textDecoration : "none" 
};

Canvas2D.Defaults.Shape = {
    labelPos       : "center",
    labelColor     : "black"
};

Canvas2D.Defaults.Rectangle = {
    lineWidth      : 1,
    lineColor      : "rgba(0,0,0,0)",
    fillColor      : "rgba(0,0,0,0)",
    labelPos       : "center",
    labelColor     : "black",
    width          : 50,
    height         : 50
};

Canvas2D.Defaults.Connector = { 
    lineWidth      : 1, 
    lineColor      : "black", 
    lineStyle      : "solid",
    begin          : null, 
    end            : null,
    minTreeDist    : 30,
    minCornerDist  : 15
};
    
Canvas2D.Defaults.Text = {
    color          : "black",
    font           : "10pt Sans-Serif", 
    textAlign      : "left", 
    textDecoration : "none"
};

Canvas2D.Defaults.Line = {
    lineWidth      : 1,
    lineStyle      : "solid",
    labelPos       : "center",
    labelColor     : "black",
    color          : "black",
    dx             : 50,
    dy             : 50
};

Canvas2D.Defaults.LinePath = {
    lineWidth      : 1,
    lineStyle      : "solid",
    labelPos       : "center",
    labelColor     : "black",
    color          : "black"
};
