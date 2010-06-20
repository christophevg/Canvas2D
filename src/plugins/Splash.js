Canvas2D.Splash = Class.extend( {
  init: function init(book) {
    this.book = book;
  },

  activate: function activate() {
    this.book.on( "load", this.handleLoading.scope(this) );
    this.book.on( "sourceLoaded", this.handleLoaded.scope(this) );
  },
  
  handleLoading: function handleLoading() {
    if( ! this.overlay ) { 
      this.overlay = new Canvas2D.Splash.Overlay(this.book.HTMLElement);
    }
    this.overlay.show( "loading diagram..." );
  },
  
  handleLoaded: function handleLoaded() {
    this.overlay.hide();
  }  
} );

Canvas2D.Splash.Overlay = Class.extend( {
  init: function init(element) {
    this.target  = element;
    this.createOverlay();
  },
  
  createOverlay: function createOverlay() {
    this.overlay = document.createElement( "DIV" );
    this.overlay.style.position = "absolute";
    this.overlay.style.display  = "none";
    this.overlay.style.backgroundColor = "rgba(255,255,255,0.75)";
    this.overlay.style.textAlign = "center";
    this.overlay.style.font = "16pt Arial";
    this.overlay.style.color = "#818285";
    this.image = Canvas2D.ImageManager
      .load("http://static.thesoftwarefactory.be/images/icons/loading.gif");
    this.message = document.createElement( "DIV" );
    this.message.style.marginBottom = "20px";
    this.overlay.appendChild( this.message );
    this.overlay.appendChild( this.image );
    document.body.appendChild( this.overlay );
  },
  
  show: function show(msg) {
    this.updateGeometry();
    this.message.innerHTML = msg;
    this.overlay.style.display = "block";
  },
  
  hide: function hide() {
    this.overlay.style.display = "none";
  },
  
  updateGeometry: function updateGeometry() {
    var geo = getGeometry( this.target );
    this.overlay.style.top    = ( geo.top    + 1 ) + "px";
    this.overlay.style.left   = ( geo.left   + 1 ) + "px";
    this.overlay.style.width  = ( geo.width      ) + "px";
    this.overlay.style.height = ( geo.height     ) + "px";
    this.message.style.marginTop = ( (geo.height / 2 ) - 40 ) + "px";
  }
} );

function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
	  do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
  } else {
    alert( "warning: no offsetParent" );
  }
	return { left: curleft, top: curtop };
}

function getGeometry( element ) {
  var pos = findPos(element);
  // FIXME: this is canvas element specific:
  var size = { width: element.width, height: element.height };
  return { 
    left: pos.left, top: pos.top, 
    width: size.width, height: size.height 
  };
}

Canvas2D.Splash.getInstance = function getInstance( book ) {
  return new Canvas2D.Splash(book);
};

Canvas2D.Book.addPlugin( "Splash", Canvas2D.Splash );
