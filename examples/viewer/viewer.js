/**
* Canvas2D Viewer
* Copyright 2010 Christophe VG & TheSoftwareFactory
*/

Canvas2D.Repository = Class.extend( {
  init: function init(url) {
    this.url = url;
    this.fetcher = new ProtoJS.Ajax();
  },

  fetch: function fetch(content) {
    return this.fetcher.fetch( this.url + "/" + content );
  },

  list: function list() {
    return eval(this.fetch( "list.json" ));
  },

  get: function get(id) {
    return this.fetch( id + ".adl" );
  }
} );

function ElementDimensions(elem) {
	this.inner = {	//content and padding; gives 0 for inline elements (you can use scrollWidth/Height if it's inline)
		width: elem.clientWidth,
		height: elem.clientHeight
	};
	this.outer = {	//everything (content, padding, scrollbar, border)
		width: elem.offsetWidth,
		height: elem.offsetHeight
	};
	this.scroll = {
		//width & height of entire content field (including padding), visible or not
		//incorrect in Opera; it doesn't include the padding
		width: elem.scrollWidth,
		//if there are no scrollbars, IE gives the actual height of the content instead of the height of the element
		height: elem.scrollHeight<elem.clientHeight ? elem.clientHeight : elem.scrollHeight,
		
		//scroll position of content & padding
		left: elem.scrollLeft,
		top: elem.scrollTop
	};
}

Canvas2D.Grow = Class.extend( {
  init: function init(canvas, padding) {
    this.canvas = canvas;
    this.element = this.canvas.canvas.canvas;
    this.padding = padding;
    this.handleResize();
    this.wireHandlers();
  },
  
  wireHandlers: function wireHandlers() {
    ProtoJS.Event.observe( window, "resize", this.handleResize.scope(this) );
  },
  
  handleResize: function handleResize() {
    this.element.width  = parseInt(this.element.parentElement.clientWidth) - this.padding;
    this.element.height = parseInt(this.element.parentElement.clientHeight) - this.padding * 2;
    this.canvas.rePublish();
  }
} );

Canvas2D.Viewer = Class.extend( {
  init: function init() {
    this.setupElements();
    this.refreshNavigator();
  },

  setupElements: function setupElements() {
    this.navigator  = document.getElementById(Canvas2D.Viewer.config.navigator);
    this.info       = document.getElementById(Canvas2D.Viewer.config.info);
    this.repository = new Canvas2D.Repository(Canvas2D.Viewer.config.repository);
    this.viewer     = Canvas2D.getBook(Canvas2D.Viewer.config.canvas);
    new Canvas2D.Grow(this.viewer, 10);
  },

  _createLink: function _createLink(label, handler) {
    var l = document.createElement("LI");
    var a = document.createElement("A");
    a.href = "#";
    a.onclick = handler;
    var t = document.createTextNode(label);
    a.appendChild(t);
    l.appendChild(a);
    return l;
  },

  refreshNavigator: function refreshNavigator() {
    var list = document.createElement("UL");
    var viewer = this;
    this.repository.list().iterate(function(diagram) {
      list.appendChild(
        this._createLink( 
          diagram.label, 
          function() { viewer.show(diagram); } 
        )
      );
    }.scope(this) );
    this.navigator.innerHTML = "";
    this.navigator.appendChild(list);
  },

  show: function load(diagram) {
    this.info.innerHTML = diagram.info;
    this.viewer.load( this.repository.get(diagram.id) );
  }
});

Canvas2D.Viewer.config = {
  repository : "./",
  canvas     : "C2D_Viewer",
  navigator  : "C2D_Navigator",
  info       : "C2D_Info"
};

Canvas2D.on( "ready", function() { new Canvas2D.Viewer(); } );
