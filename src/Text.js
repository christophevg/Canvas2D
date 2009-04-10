Canvas2D.Text = Class.create( Canvas2D.Rectangle, {
    getClass : function() { return Canvas2D.Text; },
    getType  : function() { return "text"; },
    getAllProperties: function($super) {
	return $super().concat( [ "text", "color", "font", "textAlign",
	                          "textDecoration" ] );
    },
    getClassHierarchy : function($super) {
	return $super().concat( Canvas2D.Text );
    },

    draw: function(sheet, left, top) {
	sheet.useCrispLines  = this.getUseCrispLines();
	sheet.strokeStyle    = this.getColor();
	sheet.fillStyle      = this.getColor();
	sheet.font           = this.getFont();
	sheet.textAlign      = this.getTextAlign();
	sheet.textDecoration = this.getTextDecoration();
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
	var value = ( typeof pair.value.value != "undefined" ? 
		      pair.value.value.value : "" );
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
