Canvas2D.Sheet = Class.extend( {
  init: function init(props) {
    props = props || {};

    this.book = props.book;

    this.name  = props.name  || "default";   // name of the sheet
    this.style = props.style || "static";    // selected style

    this.clear();
    this.dirty = false;

    if(props.canvas) { this.setCanvas(props.canvas); }

    Canvas2D.Keyboard.on( "keyup", this.handleKeyDown.scope(this) );
  },

  setCanvas: function setCanvas(canvas) {
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
      this[prop] = Canvas2D.Sheet.Defaults[prop] || this.canvas[prop];
    }.scope(this) );
  },

  transferProperties : function() {
    Canvas2D.Sheet.Properties.iterate(function(prop) {
      this.canvas[prop] = this[prop];
    }.scope(this) );
  },

  transferBackProperties : function() {
    Canvas2D.Sheet.Properties.iterate(function(prop) {
      this[prop] = this.canvas[prop];
    }.scope(this) );
  },

  makeDirty: function() {
    this.dirty = true;
    this.fireEvent( "change" );
  },

  isDirty: function() {
    return this.dirty;
  },

  clear: function() {
    this.positions      = []; // list of shapes on the sheet
    this.shapesMap      = {}; // name to shape mapping
    this.positionsMap   = {}; // shape to position mapping
    this.selectedShapes = []; // list of selected shapes

    this.fireEvent( "change" );
  },

  makeDynamic: function() { this.style = "dynamic";         },
  makeStatic : function() { this.style = "static";          },
  isDynamic  : function() { return this.style == "dynamic"; },
  isStatic   : function() { return !this.isDynamic();       },

  freeze: function() { this.fireEvent( "freeze" ); },
  thaw:   function() { this.fireEvent( "thaw" );   },

  at: function(left, top) {
    this.newTop  = top;
    this.newLeft = left;
    return this;
  },

  put: function(shape) {
    return this.add(shape);
  },

  add: function(shape) {
    var baseName = shape.getName().replace(/<.*$/,'');
    if( this.shapesMap[baseName] ) {
      // TODO: this.book dependency should be enforced
      var logger = this.book ? this.book : console;
      logger.log( "WARNING: Shape with name '" + baseName + 
                  "' already exists. Skipping." );
      return null;
    }

    var position = new Canvas2D.Position( shape, this.newLeft, this.newTop);
    shape   .on( "change", this.makeDirty.scope(this) );
    position.on( "change", this.makeDirty.scope(this) );

    this.newLeft = null;
    this.newTop = null;

    this.positions.push(position);
    this.shapesMap[baseName] = shape;
    this.positionsMap[shape.getName()] = position;

    this.fireEvent( "newShape", "added new shape" + 
    ( position.getLeft() != null ? 
    "@" + position.getLeft() + "," 
    + position.getTop() : "" ) );

    this.makeDirty();

    return shape;
  },

  getPosition: function getPosition(shape) {
    return this.positionsMap[shape.getName()];
  },

  hit: function(x,y) {
    for( var s = this.positions.length-1; s>=0; s-- ) {
      var position = this.positions[s];
      if( position.hit(x,y) ) {
        if( Canvas2D.Keyboard.keyDown(91) ||    // cmd
        Canvas2D.Keyboard.keyDown(17) )     // ctrl
        {
          // adding and removing
          if( this.selectedShapes.contains(position) ) {
            this.selectedShapes.remove(position);
          } else {
            this.selectedShapes.push(position);
          }
        } else {
          if( !this.selectedShapes.contains(position) ) {
            this.selectedShapes = [ position ];
          } else {
            // just clicked on already selected shape
            return;
          }
        }
        this.fireEvent( "shapeSelected", position );
        return;
      }
    }
    // no position was hit, so clearing the selection list
    this.selectedShapes = [];
  },

  hitArea: function( left, top, right, bottom ) {
    var newSelection =  
    ( Canvas2D.Keyboard.keyDown(91) || // cmd
    Canvas2D.Keyboard.keyDown(17) ) // ctrl
    ? this.selectedShapes : [];
    for( var s = this.positions.length-1; s>=0; s-- ) {
      if( this.positions[s].hitArea(left, top, right, bottom) ) {
        newSelection.push( this.positions[s] );
        this.fireEvent( "shapeSelected", this.positions[s] );
      }
    }
    this.selectedShapes = newSelection.unique();
  },

  handleMouseDown: function(pos) {
    if( !this.isDynamic() ) { return; }
    this.hit( pos.x, pos.y );
    this.currentPos = pos;
    this.makeDirty();
  },

  handleMouseUp: function(pos) {
    if( !this.isDynamic() ) { return; }
    this.selectedShapes.iterate(function(position) {
      this.fireEvent( "shapesMoved",
      "Shape moved to " + 
      position.left + ", " + position.top );
    }.scope(this) );
    this.showSelection   = false;
    this.makeDirty();
  },

  handleMouseDrag: function(pos) {
    if( !this.isDynamic() ) { return; }
    if( !this.showSelection && this.selectedShapes.length > 0 ) {
      this.moveCurrentSelection(pos.dx, pos.dy);
    } else {
      // we've lost our currentPos somewhere (probably a new sheet load)
      if( !this.currentPos ) { this.currentPos = pos; }
      this.showSelection = true;
      this.hitArea( this.currentPos.x, this.currentPos.y, pos.x, pos.y );
      this.selectionPos  = pos;
    }
    this.makeDirty();
  },

  selectAllShapes: function() {
    // FIXME: only selectable shapes (so no connectors)
    this.selectedShapes = [];
    this.positions.iterate( function(position) { 
      this.selectedShapes.push(position) 
    }.scope(this) );
    this.makeDirty();
  },

  moveCurrentSelection: function(dx, dy) {
    this.selectedShapes.iterate(function(position) {	
      position.move(dx, dy);
    }.scope(this) );
  },

  handleKeyDown: function(key) {
    if( Canvas2D.Keyboard.keyDown(16) ) { // shift + 
      switch(key) {
        case 37: this.moveCurrentSelection( -5,  0 ); break; // left
        case 38: this.moveCurrentSelection(  0, -5 ); break; // up
        case 39: this.moveCurrentSelection(  5,  0 ); break; // right
        case 40: this.moveCurrentSelection(  0,  5 ); break; // down
      }
    }
    if( ( Canvas2D.Keyboard.keyDown(91) ||    // cmd 
    Canvas2D.Keyboard.keyDown(17) ) &&  // ctrl +
    key == 65 &&                          // a
    this.canvas.mouseOver )
    {
      this.selectAllShapes();
    }
  },

  addSelectionOverlay: function() {
    if( this.showSelection ) { 
      var pos = this.selectionPos;
      var dx = pos.x - this.currentPos.x;
      var dy = pos.y - this.currentPos.y;

      this.canvas.fillStyle = "rgba( 0, 0, 255, 0.1 )";
      this.canvas.fillRect( pos.x <= this.currentPos.x ?  
        pos.x : this.currentPos.x, 
        pos.y <= this.currentPos.y ?
        pos.y : this.currentPos.y,
        Math.abs(dx), Math.abs(dy) );
    }
  },

  addSelectionMarkers: function() {
    this.selectedShapes.iterate( function(shape) {
      var box = shape.getBox();
      this.canvas.fillStyle = "rgba( 200, 200, 255, 1 )";
      [[ box.left, box.top    ], [ box.right, box.top    ],
      [ box.left, box.bottom ], [ box.right, box.bottom ]].iterate( 
        function(corner) {
          this.canvas.beginPath();
          this.canvas.arc( corner[0],  corner[1], 5, 0, Math.PI*2, true );
          this.canvas.fill();	
        }.scope(this) );
    }.scope(this) );
  },

  render: function() {
    var delayed = [];
    this.positions.iterate( function(shape) { 
      if( shape.delayRender() ) {
        delayed.push(shape);
      } else {
        shape.render(this); 
      }
    }.scope(this) );

    delayed.iterate( function(shape) { 
      shape.render(this); 
    }.scope(this) );

    this.addSelectionOverlay();
    this.addSelectionMarkers();
  },

  toADL: function() {
    var s = "";
    s += "Sheet "  + this.name;
    s += " +" + this.style + " {\n";
    this.positions.iterate(function(shape) { 
      var t = shape.toADL("  ");
      if( t ) { s += t + "\n"; }
    } );
    s += "}";
    return s;
  }
} );

// add-in some common functionality
ProtoJS.mix( Canvas2D.Factory.extensions.all.EventHandling, 
             Canvas2D.Sheet.prototype );

Canvas2D.Sheet.Properties = 
  [ "globalAlpha", "globalCompositeOperation",
    "strokeStyle", "fillStyle", "lineWidth", 
    "lineCap", "lineJoin", "miterLimit", 
    "shadowOffsetX", "shadowOffsetY", "shadowBlur", "shadowColor",
    "font", "textAlign", "textBaseline",
    "lineStyle", "useCrispLines", "textDecoration" ];

Canvas2D.Sheet.Operations = 
  [ "save", "restore", 
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
    "getFontSize", "fillStrokeRect" ];

Canvas2D.Sheet.from = function(construct, book) {
  var style = "static";
  var styleModifier = construct.modifiers.get( "style" );
  if( styleModifier ) {
    style = styleModifier.value.value.toLowerCase();
  }

  construct.modifiers.iterate(function(key, value) {
    if( key.toLowerCase() == "static" || key.toLowerCase() == "dynamic" ) {
      style = key.toLowerCase();
    }
  });

  return new Canvas2D.Sheet({ book: book, 
                              name: construct.name, style: style } );
};

Canvas2D.Sheet.MANIFEST = {
  name      : "sheet",
  properties : [],
  libraries : [ "Canvas2D" ]
};

Canvas2D.registerShape( Canvas2D.Sheet );
