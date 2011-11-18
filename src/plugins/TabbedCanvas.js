Canvas2D.Book.plugins.TabbedCanvas = Class.extend( {
  init: function(book) {
    this.book = book;
  },

  makeTab: function(name, height, content) {
    var tab = document.createElement("div");
    tab.className = "tabbertab";
    tab.style.height = ( 4 + parseInt(height) ) + "px";
    var head = document.createElement("h2");
    var txt = document.createTextNode(name);
    head.appendChild(txt);
    tab.appendChild(head);
    tab.appendChild(content);
    return tab;
  },

  getAboutTab: function() {
    var width  = this.book.canvas.canvas.width;
    var height = this.book.canvas.canvas.height;
    var about  = document.createElement("div");
    about.className = "Canvas2D-about";
    about.style.height = height + "px";
    about.style.width = (parseInt(width)-4)  + "px";

    var libraries = "";
    Canvas2D.extensions.iterate(function(library) {
      libraries += "\n<hr>\n";
      libraries += "<b>Library: " +
      library.name + " " + library.version + "</b> " + 
      "by " + library.author + "<br>" +
      library.info;
    });

    about.innerHTML = '<span class="Canvas2D-about-text">' +
    '<b>Canvas2D ' + Canvas2D.version  + 
    '</b><br>Copyright &copy 2009, ' +
    '<a href="http://christophe.vg" target="_blank">Christophe VG</a>'+ 
    ' & <a href="http://thesoftwarefactory.be" ' +
    'target="_blank">The Software Factory</a><br>' + 
    'Visit <a href="http://thesoftwarefactory.be/wiki/Canvas2D" ' +
    'target="_blank">http://thesoftwarefactory.be/wiki/Canvas2D</a> ' +
    'for more info. Licensed under the ' +
    '<a href="http://thesoftwarefactory.be/wiki/BSD_License" ' + 
    'target="_blank">BSD License</a>.' + libraries + '</span>';
    return this.makeTab("About", height, about );
  },

  getConsoleTab: function() {
    var width  = this.book.canvas.canvas.width;
    var height = this.book.canvas.canvas.height;
    this.book.console = document.createElement("textarea");
    this.book.console.className = "Canvas2D-console";
    this.book.console.style.height = height + "px";
    this.book.console.style.width  = ( parseInt(width) - 4 )  + "px";
    return this.makeTab("Console", height, this.book.console );
  },

  getSourceTab: function() {
    var width    = this.book.canvas.canvas.width;
    var height   = this.book.canvas.canvas.height;
    var oldValue = this.book.generated ? this.book.generated.value : "";
    this.book.generated = document.createElement("textarea");
    this.book.generated.value = oldValue;
    this.book.generated.className = "Canvas2D-source";
    this.book.generated.style.height = height + "px";
    this.book.generated.style.width  = ( parseInt(width) - 4 )  + "px";
    return this.makeTab("Source", height, this.book.generated );
  },

  applyTabber: function() {
    var source = this.book.canvas.canvas;

    this.tabber = document.createElement("div");
    this.tabber.className    = "tabber";
    this.tabber.style.width  = (parseInt(source.width)  + 17) + "px";
    this.tabber.style.height = (parseInt(source.height) + 37) + "px";
    source.parentNode.replaceChild(this.tabber, source);	

    var tab1 = document.createElement("div");
    tab1.className = "tabbertab";
    var h1 = document.createElement("h2");
    var t1 = document.createTextNode("Diagram");
    h1.appendChild(t1);
    tab1.appendChild(h1);
    tab1.appendChild(source);
    this.tabber.appendChild(tab1);
  },

  makeTabbed: function(tabs) {
    if( !this.tabber ) { this.applyTabber(); }
    if( typeof tabs.contains == "undefined" ) { return; }

    if( tabs.contains("console") ) { 
      this.tabber.appendChild(this.getConsoleTab());
    }
    if( tabs.contains("source") ) {
      this.tabber.appendChild(this.getSourceTab());
    }
    if( tabs.contains("about") ) { 
      this.tabber.appendChild(this.getAboutTab());
    }
    tabberAutomatic(); 
  }
} );

Canvas2D.Book.plugins.TabbedCanvas.exposes = [ "makeTabbed" ];
