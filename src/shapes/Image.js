Canvas2D.Image = Canvas2D.Rectangle.extend( {
  afterInit: function afterInit() {
    if( this.getSrc() ) {
      this.image = Canvas2D.ImageManager.load( 
        this.getSrc(), this.updateSize.scope(this) 
      );
    }
  },

  updateSize: function updateSize() {
    this.width  = this.image ? 
      this.image.width  : this.getPropertyDefault("width");
    this.height = this.image ? 
      this.image.height : this.getPropertyDefault("height");
    this.announceChange();
  },

  draw: function draw(sheet, left, top) {
    sheet.drawImage(this.image, left, top);
  }
} );

Canvas2D.Image.MANIFEST = {
  name         : "image",
  aliasses     : [ "pic", "picture" ],
  properties   : { "src" : new Canvas2D.Types.URL() },
  propertyPath : [ Canvas2D.Rectangle ],
  libraries    : [ "Canvas2D" ]
};

Canvas2D.Image.Defaults = {
  src : ""
};

Canvas2D.registerShape( Canvas2D.Image );
