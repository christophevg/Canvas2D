/**
* Canvas2D Viewer
* Copyright 2010 Christophe VG & TheSoftwareFactory
*/

Canvas2D.Repository = Class.extend( {
  apply: function apply(input, onReadyHandler) {
    // FIXME: check if id, else return adl ???
    this.get(input, onReadyHandler);
  },

  init: function init(book, url) {
    this.url = url;
    this.book = book;
    this.fetcher = new ProtoJS.Ajax();
  },

  activate: function activate() {
    this.book.addLoadFilter(this);
  },

  fetch: function fetch(content, onReadyHandler) {
    this.fetcher.fetch( this.url + content, function(xmlhttp) { 
      if( xmlhttp.readyState == 4 ) {
        onReadyHandler(xmlhttp.responseText); 
      }
    } );
  },

  list: function list( onReadyHandler ) {
    this.fetch( "list.json", function(result) { 
      onReadyHandler(eval(result)); 
    } );
  },

  get: function get(id, onReadyHandler) {
    this.fetch( id + ".adl", onReadyHandler );
  }
} );

Canvas2D.Repository.addRepository = function addRepository(name, repository) {
  if( ! Canvas2D.Repository.repositories ) { 
    Canvas2D.Repository.repositories = $H(); 
  }
  Canvas2D.Repository.repositories.set( name, repository );
};

Canvas2D.Repository.getInstance = function getInstance(book) {
  var result = book.HTMLElement.className.match(/withRepo:([^ ]+)/);
  if( result != null ) {
    var repo = Canvas2D.Repository.repositories.get(result[1]);
    if( repo ) {
      return new Canvas2D.Repository( book, repo );
    }
  }
  return null;
};

Canvas2D.Book.addPlugin( "Repository", Canvas2D.Repository );

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
    this.element.width  = parseInt(this.element.parentNode.clientWidth) - this.padding;
    this.element.height = parseInt(this.element.parentNode.clientHeight) - this.padding * 2;
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
    this.book       = Canvas2D.getBook(Canvas2D.Viewer.config.canvas);
    this.repository = this.book.getPlugin( "Repository" );
    new Canvas2D.Grow(this.book, 10);
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
    this.repository.list(this.populateNavigator.scope(this));
  },

  populateNavigator: function populateNavigator(diagrams) {
    var list = document.createElement("UL");
    var viewer = this;
    diagrams.iterate(function(diagram) {
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

  show: function show(diagram) {
    this.info.innerHTML = diagram.info;
    this.book.load( diagram.id );
  }
});

Canvas2D.Viewer.config = {
  repository : "./",
  canvas     : "C2D_Viewer",
  navigator  : "C2D_Navigator",
  info       : "C2D_Info"
};

Canvas2D.on( "ready", function() { new Canvas2D.Viewer(); } );
