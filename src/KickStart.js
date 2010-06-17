Canvas2D.KickStart = { 
  triggers: [ "Canvas2D" ] // list of CSS classnames that trigger KickStarting
};

Canvas2D.KickStart.Starter = Class.extend( {
  init: function() {
    this.initManager();
  },
  
  initManager: function initManager() {
    this.manager = new Canvas2D.Manager();
  },
  
  makeInstance: function makeInstance( name ) {
    return this.manager.setupBook(name);
  },   

  start: function start() {
    var htmlCanvases = document.getElementsByTagName( "canvas" );
    for(var c=0; c<htmlCanvases.length; c++ ) {
      var htmlCanvas = htmlCanvases[c];
      var classes = htmlCanvas.className;
      if( classes.containsOneOf(Canvas2D.KickStart.triggers) ) {
        var name = htmlCanvas.id;
        var book = this.makeInstance(htmlCanvas);
        var sourceElement = document.getElementById(name+"Source");
        if( sourceElement ) {
          var source;
          try {
            // some HTML element, PRE, DIV, ...
            source = sourceElement.firstChild.nodeValue;
          } catch(err) {
            // TEXTAREA
            source = sourceElement.value;
          }
          book.load(source);
        }
      }
    }
    this.fireEvent( "ready" );
    this.manager.startAll();
  },
  
  getName: function getName() { return "KickStarter"; }
} );


// add-in some common functionality
ProtoJS.mix( 
  Canvas2D.Factory.extensions.all.EventHandling,
  Canvas2D.KickStart.Starter.prototype 
);

// start as soon as the window has been loaded
ProtoJS.Event.observe( window, 'load', function() { 
  Canvas2D.KickStarter = new Canvas2D.KickStart.Starter();
  Canvas2D.KickStarter.on( "ready", function() { 
    Canvas2D.fireEvent( "ready" );
  } );
  Canvas2D.KickStarter.start(); 
} );
