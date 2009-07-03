Canvas2D.Text = Canvas2D.Rectangle.extend( {
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

    asConstruct: function() {
	var construct = this._super();
	construct.addModifiers( [ "color" ] );
	return construct;
    }
} );

Canvas2D.Text.from = function( construct, sheet ) {
    var props = { name: construct.name, text: construct.value.value };
    construct.modifiers.iterate(function(key, value) {
	value = ( typeof value.value != "undefined" ? 
		      value.value.value : "" );
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

Canvas2D.Text.MANIFEST = {
    name         : "text",
    properties   : [ "text", "color", "font", "textAlign","textDecoration" ],
    propertyPath : [ Canvas2D.Rectangle ],
    libraries    : [ "Canvas2D" ]
};

Canvas2D.registerShape( Canvas2D.Text );
