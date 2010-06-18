Canvas2D.Image = Canvas2D.Rectangle.extend( {
  afterInit: function afterInit() {
    if( this.getSrc() ) {
      this.image = Canvas2D.ImageManager.load( 
        this.getSrc(), this.updateSize.scope(this) 
      );
    }
  },

  updateSize: function updateSize() {
    this.width  = this.image.width;
    this.height = this.image.height;
  },

  draw: function draw(sheet, left, top) {
    sheet.drawImage(this.image, left, top);
  }
} );

Canvas2D.Image.MANIFEST = {
  name         : "image",
  aliasses     : [ "pic", "picture" ],
  properties   : { "src" : Canvas2D.Types.URL },
  propertyPath : [ Canvas2D.Rectangle ],
  libraries    : [ "Canvas2D" ]
};

Canvas2D.Image.Defaults = {};

Canvas2D.registerShape( Canvas2D.Image );
