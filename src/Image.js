Canvas2D.Image = Class.create( Canvas2D.Rectangle, {
    src: null,       // the src location
    image : null,    // the actual (HTML) image

    initialize: function($super, props) {
	props = props || {};
	
	this.src = props['src'];
	if( this.src ) {
	    this.image = new Image();
	    this.image.src = this.src;
	    var me = this;
	    this.image.onload = function() { 
		me.props.width = me.image.width;
		me.props.height = me.image.height;
		me.canvas.render();  
	    }
	}
	$super(props);
    },

    draw: function() {
	this.canvas.drawImage(this.image, this.props.left, this.props.top );
    },

    toADL: function(prefix) {
	var s = this.positionToString(prefix);
	s += "Image "  + this.name;
	s += " +src=\"" + this.style + "\";";
	return s;
    }

} );

Canvas2D.Image.getNames = function() {
    return [ "image", "pic", "picture" ];
}

Canvas2D.Image.from = function(construct, canvas) {
    var src = null;
    var srcModifier = construct.modifiers.get( "src" );
    if( srcModifier ) {
	src = srcModifier.value.value.toLowerCase();
    }

    var image = new Canvas2D.Image({ name: construct.name, src: src } );
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
