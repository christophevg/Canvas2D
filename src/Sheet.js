Canvas2D.Sheet = Canvas2D.Shape.extend( {
	afterInit: function afterInit() {
		this.reset();
	},
	
  getContainer: function getContainer() {
    return this;
  },

  setCanvas: function setCanvas(canvas) {
		if( ! canvas ) { return; } 
    this.canvas = canvas;
    this.wireCanvasDelegation();
    this.setupProperties();
  },

  getHeight: function getHeight() {
    return this.canvas.canvas.height;
  },

  wireCanvasDelegation: function wireCanvasDelegation() {
    if( !this.canvas ) { return; }

    Canvas2D.Sheet.Operations.iterate(function(operation) {
      if( operation == "restore" ) {
        this[operation] = function() {
          this.canvas[operation].apply(this.canvas, arguments);
          this.transferBackProperties();
          return;
        }.scope(this);
      } else {
        this[operation] = function() {
          this.transferProperties();
          return this.canvas[operation].apply(this.canvas, arguments);
        }.scope(this);
      }
    }.scope(this) );
  },

  setupProperties: function setupProperties() {
    Canvas2D.Sheet.Properties.iterate( function(prop) {
      this[prop] = Canvas2D.Sheet.Defaults[prop] || 
				this.getCurrentCanvasProperty[prop];
    }.scope(this) );
  },

	getCurrentCanvasProperty: function getCurrentCanvasProperty(prop) {
		return ( this.canvas && this.canvas[prop] ) ? this.canvas[prop] : null;
	},

  transferProperties : function transferProperties() {
    Canvas2D.Sheet.Properties.iterate(function(prop) {
      this.canvas[prop] = this[prop];
    }.scope(this) );
  },

  transferBackProperties : function transferBackProperties() {
    Canvas2D.Sheet.Properties.iterate(function(prop) {
      this[prop] = this.canvas[prop];
    }.scope(this) );
  },

	reset: function reset() {
    this.positions      = []; // list of positioned shapes on the sheet
    this.shapesMap      = {}; // name to shape mapping
    this.positionsMap   = {}; // shape to position mapping
	},

  clear: function clear(silent) {
		this.reset();
    this.fireEvent( "change" );
  },

  freeze: function freeze() { this.fireEvent( "freeze" ); },
  thaw:   function thaw()   { this.fireEvent( "thaw" );   },

  at: function at(left, top) {
    this.newTop  = top;
    this.newLeft = left;
    return this;
  },

  put: function put(shape) {
    return this.add(shape);
  },
  
  remove: function remove(shape) {
    var baseName = shape.getName().replace(/<.*$/,'');
    shape.on( "change", function(){} );
    delete this.shapesMap[baseName];
    this.positions.remove(this.positionsMap[baseName]);
    delete this.positionsMap[baseName];
    this.positions.remove(shape);
    this.fireEvent( "removeShape", shape );
    this.book.rePublish();
  },

  addPosition: function addPosition(position) {
    var shape = position.shape;

    var baseName = shape.getName().replace(/<.*$/,'');
    if( this.shapesMap[baseName] ) {
      var logger = this.book ? this.book : console;
      logger.logWarning( "Shape with name '" + baseName + 
                         "' already exists. Skipping." );
      return null;
    }

    position.on( "change", function( msg ) {
      this.book.logInfo( msg );
      this.book.rePublish();
    }.scope(this) );

    shape.on( "change", function( msg ) {
      this.book.logInfo( msg );
      this.book.rePublish();
    }.scope(this) );

    this.positions.push(position);
    this.shapesMap[baseName] = shape;
    this.positionsMap[shape.getName()] = position;

    this.fireEvent( "newShape", "added new shape" + 
      ( position.getLeft() != null ? "@" + position.getLeft() + "," +
        position.getTop() : "" ) );

    this.book.rePublish();

    return shape;
  },

  add: function add(shape) {
    return this.addPosition(
      new Canvas2D.Position( shape, this.newLeft, this.newTop ) 
    );
  },

  getPosition: function getPosition(shape) {
    return this.positionsMap[shape.getName()];
  },

  render: function render() {
    var delayed = [];
    this.positions.iterate( function(shape) { 
      if( shape.delayRender() ) {
        delayed.push(shape);
      } else {
        shape.render(this); 
      }
    }.scope(this) );

    delayed.iterate( function(shape) { shape.render(this); }.scope(this) );
    
    this.fireEvent( "afterRender", this );
  },
  
  asConstruct: function asConstruct() {
    var construct = this._super();
    this.positions.iterate(function(position) {
      var c = position.asConstruct();
      if( c ) { construct.children.push( c ); }
    } );
    return construct;
  }
} );

Canvas2D.Sheet.Properties = [ 
"globalAlpha", "globalCompositeOperation",
"strokeStyle", "fillStyle", "lineWidth", 
"lineCap", "lineJoin", "miterLimit", 
"shadowOffsetX", "shadowOffsetY", "shadowBlur", "shadowColor",
"font", "textAlign", "textBaseline",
"lineStyle", "useCrispLines", "textDecoration" 
];

Canvas2D.Sheet.Operations = [ 
"save", "restore", 
"scale", "rotate", "translate", "transform", "setTransform",
"createRadialGradient", "createPattern",
"clearRect", "fillRect", "strokeRect",
"beginPath", "closePath", "moveTo", "lineTo",
"quadraticCurveTo", "bezierCurveTo", 
"arcTo", "rect", "arc",
"fill", "stroke", 
"clip","isPointInPath", 
"fillText","fillText","strokeText","strokeText","measureText",
"drawImage","createImageData","getImageData","putImageData",
"getFontSize", "fillStrokeRect" 
];

Canvas2D.Sheet.MANIFEST = {
  name      : "sheet",
  properties : {
    book   : new Canvas2D.Types.Parent(),
    origin : new Canvas2D.Types.Position()
  },
  libraries : [ "Canvas2D" ]
};

Canvas2D.registerShape( Canvas2D.Sheet );

Canvas2D.Sheet.Defaults = { 
  name           : "newSheet",
  style          : "static",
  lineWidth      : 1,   
  lineStyle      : "solid",
  strokeStyle    : "black", 
  fillStyle      : "black", 
  font           : "10pt Sans-Serif", 
  textAlign      : "left", 
  textBaseline   : "alphabetic",
  textDecoration : "none",
  shadowColor    : "rgba(0,0,0,0.0)",
	useCrispLines  : true   // FIXME: temp solution, because getProperty turns undefined
};
