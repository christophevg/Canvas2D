Canvas2D.Text = Canvas2D.Rectangle.extend( {
    prepare: function(sheet) {
	sheet.useCrispLines  = this.getUseCrispLines();
	sheet.strokeStyle    = this.getColor();
	sheet.fillStyle      = this.getColor();
	sheet.font           = this.getFont();
	sheet.textAlign      = this.getTextAlign();
	sheet.textDecoration = this.getTextDecoration();
	this.width  = sheet.measureText(this.getText());
	this.height = sheet.getFontSize();
    },

    draw: function(sheet, left, top) {
	if( this.getTopDown() ) { top += this.getHeight(); }
	sheet.fillText(this.getText(), left, top );
    },

    asConstruct: function() {
	var construct = this._super();
	construct.addModifiers( [ "color" ] );
	return construct;
    }
} );

Canvas2D.Text.from = function( construct, parent ) {
    var props = { name: construct.name, text: construct.value.value };
    construct.modifiers.iterate(function(key, value) {
	value = ( typeof value.value != "undefined" ? 
		      value.value.value : "" );
	props[key] = value;
    } );

    return new Canvas2D.Text(props);
};

Canvas2D.Text.MANIFEST = {
    name         : "text",
    properties   : [ "text", "color", "font", "textAlign","textDecoration" ],
    propertyPath : [ Canvas2D.Rectangle ],
    libraries    : [ "Canvas2D" ]
};

Canvas2D.registerShape( Canvas2D.Text );
