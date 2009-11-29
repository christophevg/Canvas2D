Canvas2D.Defaults = {};

Canvas2D.Defaults.Canvas = {
    lineWidth      : 1,   
    useCrispLines  : true,
    lineStyle      : "solid",
    strokeStyle    : "black", 
    fillStyle      : "black", 
    font           : "10pt Sans-Serif", 
    textAlign      : "left", 
    textBaseline   : "alphabetic",
    textDecoration : "none"    
};

Canvas2D.Sheet.Defaults = { 
    lineWidth      : 1,   
    lineStyle      : "solid",
    strokeStyle    : "black", 
    fillStyle      : "black", 
    font           : "10pt Sans-Serif", 
    textAlign      : "left", 
    textBaseline   : "alphabetic",
    textDecoration : "none",
    shadowColor    : "rgba(0,0,0,0.0)"
};

// Shapes start here ...

Canvas2D.Shape.Defaults = {
    useCrispLines      : true,
    label              : "",
    labelFont          : "7pt Sans-Serif",
    labelAlign         : "center",
    labelPos           : "center",
    labelColor         : "black",
    labelUseCrispLines : false
};

Canvas2D.Rectangle.Defaults = {
    useCrispLines  : true,
    lineWidth      : 1,
    lineColor      : "rgba(0,0,0,100)",     // solid black
    fillColor      : "rgba(255,255,255,0)", // empty white ;-)
    labelPos       : "center",
    labelColor     : "black",
    width          : 50,
    height         : 50
};

Canvas2D.Connector.Defaults = {
    useCrispLines  : true,
    lineWidth      : 1, 
    lineColor      : "black", 
    lineStyle      : "solid",
    begin          : null, 
    end            : null,
    minTreeDist    : 30,
    minCornerDist  : 15
};
    
Canvas2D.Text.Defaults = {
    useCrispLines  : false,
    color          : "black",
    font           : "10pt Sans-Serif", 
    textAlign      : "left", 
    textDecoration : "none"
};

Canvas2D.Line.Defaults = {
    lineWidth      : 1,
    lineStyle      : "solid",
    labelPos       : "center",
    labelColor     : "black",
    color          : "black",
    dx             : 50,
    dy             : 50
};

Canvas2D.LinePath.Defaults = {
    lineWidth      : 1,
    lineStyle      : "solid",
    labelPos       : "center",
    labelColor     : "black",
    color          : "black"
};

Canvas2D.Image.Defaults = {

};

Canvas2D.Arrow.Defaults = {

};

Canvas2D.CompositeShape.Defaults = {

};

