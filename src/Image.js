Canvas2D.Image = Canvas2D.Rectangle.extend( {
    getSource : function() { return this.src;   },
    getImage  : function() { return this.image; },

    postInitialize: function() {
	if( this.getSource() ) {
	    this.image = 
		Canvas2D.ImageManager.load( this.getSource(), 
					    this.updateSize.scope(this) );
	}
    },

    updateSize: function() {
	this.width  = this.image.width;
	this.height = this.image.height;
    },

    draw: function(sheet,left,top) {
	sheet.drawImage(this.getImage(), left, top);
    },

    asConstruct: function() {
	var construct = this._super();
	construct.addModifiers( [ "source" ] );
	return construct;
    }
} );

Canvas2D.Image.from = function(construct, canvas) {
    var props = { name: construct.name };
    construct.modifiers.iterate(function(key, value) {
	props[key] = value.value.value;
    } );
    
    var left, top;
    var image = new Canvas2D.Image(props);
    if( construct.annotation ) {    
	var pos = construct.annotation.data.split(",");
	left = parseInt(pos[0]);
	top  = parseInt(pos[1]);
    } else {
	left = this.offset * ( this.unknownIndex++ );
	top = left;
    }
    canvas.at(left,top).put(image);
    return image;
};

Canvas2D.Image.MANIFEST = {
    name         : "image",
    aliasses     : [ "pic", "picture" ],
    properties   : [ "src" ],
    propertyPath : [ Canvas2D.Rectangle ],
    libraries    : [ "Canvas2D" ]
};

Canvas2D.registerShape( Canvas2D.Image );
