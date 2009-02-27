Canvas2D.WebKitCanvas = Class.create( Canvas2D.CanvasBase, {
    fillText : function(text, x, y, maxWidth) {
	this.strokeText(text, x, y, maxWidth);
	this.fill();
    },
    
    strokeText : function(text, x, y, maxWidth) {
    	this.beginPath();
	
    	this.save();
	
	this.moveTo(x, y);
	this.lineStyle = "solid";
	this.lineWidth = 1;

	if( this.textAlign == "center" ) { 
	    x -= this.measureText(text) / 2; 
	} else if( this.textAlign == "right" ) { 
	    x -= this.measureText(text);     
	}

	CanvasTextFunctions.draw(this, this.font, getFontSize(this.font), 
				 x, y, text);
	
	this.restore();
	
	this.closePath();
    },
    
    measureText  : function(text) {
    	return CanvasTextFunctions.measure(
    	    this.font, getFontSize(this.font), text);
    }
    
} );
