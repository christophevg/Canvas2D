Canvas2D.Text = Class.create( Canvas2D.Rectangle, {
    myProperties: function() {
	return [ "text", "color", "font", "align", "decoration" ];
    },

    getType  : function() { return "text"; },

    getText       : function() { return this.text;  },
    getColor      : function() { return this.color; },
    getFont       : function() { return this.font;  },
    getAlign      : function() { return this.align; },
    getDecoration : function() { return this.decoration; },

    draw: function(sheet, left, top) {
	sheet.strokeStyle    = this.getColor();
	sheet.fillStyle      = this.getColor();
	sheet.font           = this.getFont();
	sheet.textAlign      = this.getAlign();
	sheet.textDecoration = this.getDecoration();
	sheet.fillText(this.getText(), left, top );
	this.width  = sheet.measureText(this.getText());
	this.height = sheet.getFontSize();
    },

    asConstruct: function($super) {
	var construct = $super();
	if( this.getColor() ) {
	    construct.modifiers[this.getColor()] = null;
	}
	return construct;
    }
} );

Canvas2D.Text.getNames = function() {
    return [ "text" ];
}

Canvas2D.Text.from = function( construct, sheet ) {
    var props = { name: construct.name, text: construct.value.value };
    construct.modifiers.each(function(pair) {
	var key   = pair.key;
	var value = ( pair.value.value ? pair.value.value.value : "" );
	props[key] = value;
    } );

    var shape = new Canvas2D.Text(props);
    var left, top;
    if( construct.annotation ) {    
	var pos = construct.annotation.data.split(",");
	left = parseInt(pos[0]);
	top  = parseInt(pos[1]);
    } else {
	left = this.offset * ( this.unknownIndex++ );
	top = left;
    }
    sheet.at(left,top).put( shape );
    return shape;
};

Canvas2D.ADLVisitor.registerConstruct(Canvas2D.Text);
