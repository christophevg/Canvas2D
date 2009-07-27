Canvas2D.Compositors = {
    "vertical-stack": Class.extend( {
	init: function init(args, shape) {
	    this.align = args.contains("left") ? "left" :
		args.contains("right") ? "right" : "center";
	    this.shape = shape;
	},

	prepare: function prepare() {
	    this.left = 0;
	    this.top = 0;
	},

	getPadding: function getPadding() {
	    return parseInt(this.shape.padding ? this.shape.padding : 0);
	},

	getPosition: function(child) {
	    var dleft = this.getPadding();
	    var width = this.shape.getWidth();
	    if( this.align == "center" ) {
		dleft = ( width - child.getWidth() ) / 2;
	    } else if( this.align == "right" ) {
		dleft = width -  child.getWidth() - this.getPadding();
	    }
	    var top = this.top;
	    this.top += child.getHeight(); // for next child
	    return { left: this.left + dleft, 
		     top: top + this.getPadding() };
	},

	getWidth: function getWidth() {
	    // max width of all children
	    var width = 0;
	    this.shape.getChildren().iterate( function(child) {
		width = max( child.getWidth(child.grows), width );
	    });
	    return width + this.getPadding() * 2;
	},

	getHeight: function getHeight() {
	    // sum of all children's height
	    var height = 0;
	    this.shape.getChildren().iterate( function(child) {
		height += child.getHeight(child.grows);
	    });
	    return height + this.getPadding() * 2;
	},

	heightGrows: function heightGrows() { return false; },
	widthGrows : function widthGrows()  { return true;  }
    }),

    "horizontal-stack": Class.extend( {
	init: function init(args, shape) {
	    this.align = args.contains("top") ? "top" :
		args.contains("bottom") ? "bottom" : "center";
	    this.shape = shape;
	},
	
	prepare: function prepare() {
	    this.left = 0;
	    this.top = 0;
	},

	getPosition: function(child) {
	    var dtop = 0;
	    var height = this.shape.getHeight();
	    if( this.align == "center" ) {
		dtop = ( height - child.getHeight() ) / 2;
	    } else if( this.align == "bottom" ) {
		dtop = height - child.getHeight();
	    }
	    var left = this.left;
	    this.left += child.getWidth(); // next child
	    return { left: left, top: this.top + dtop };
	},

	getWidth: function getWidth() {
	    // sum of all children's width
	    var width = 0;
	    this.shape.getChildren().iterate( function(child) {
		width += child.getWidth(child.grows);
	    });
	    return width;
	},

	getHeight: function getHeight() {
	    // max height of all children
	    var height = 0;
	    this.shape.getChildren().iterate( function(child) {
		height = max(child.getHeight(child.grows), height);
	    });
	    return height;
	},

	heightGrows: function heightGrows() { return true;  },
	widthGrows : function widthGrows()  { return false; }
    })
};
