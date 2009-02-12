Canvas2D.Image = Class.create( Canvas2D.Rectangle, {
    allProperties: function($super) {
	var props = $super();
	props.push( "src"  );
	return props;
    },

    getType   : function() { return "image"; },

    getSource : function() { return this.src;   },
    getImage  : function() { return this.image; },

    initialize: function($super, props) {
	$super(props);
	
	if( this.getSource() ) {
	    this.image = new Image();
	    this.image.src = this.getSource();
	    var me = this;
	    this.image.onload = function() { 
		me.width  = me.image.width;
		me.height = me.image.height;
	    }
	}
    },

    draw: function(sheet,left,top) {
	sheet.drawImage(this.getImage(), left, top);
    },

    asConstruct: function($super) {
	var construct = $super();
	if( this.getSource() ) {
	    construct.modifiers.src = "\"" + this.getSource() + "\"";	    
	}
	return construct;
    }

} );

Canvas2D.Image.getNames = function() {
    return [ "image", "pic", "picture" ];
}

Canvas2D.Image.from = function(construct, canvas) {
    var props = { name: construct.name };
    construct.modifiers.each(function(pair) {
	var key   = pair.key;
	var value = pair.value.value.value;
	props[key] = value;
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

Canvas2D.ADLVisitor.registerConstruct(Canvas2D.Image);
