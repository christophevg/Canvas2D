/**
* DynamicSheet plugin
*
* This plugin extends Sheet with interactive capabilities.
*/

// extend book to pass mouse events to sheet
Canvas2D.DynamicBook = {};

Canvas2D.DynamicBook.setupMouseEventHandling = function setupMouseEventHandling() {
  [ "MouseDown", "MouseUp", "MouseDrag" ].iterate( function(ev) {
    this.canvas.on( ev.toLowerCase(), function(data) {
      this.fireEvent( ev.toLowerCase() );
      var sheet = this.getCurrentSheet();
      if( sheet ) {
        sheet["handle"+ev](data);
      }
    }.scope(this) );
  }.scope(this) );
},

Class.extendMethod( 
  Canvas2D.Book, "init", 
  Canvas2D.DynamicBook.setupMouseEventHandling 
);

// extend sheet with new methods to process mouse events
Canvas2D.DynamicSheet = {
  makeDirty: function makeDirty() {
    this.dirty = true;
    this.fireEvent( "change" );
  },
  isDirty    : function isDirty()     { return this.dirty;              },
  makeDynamic: function makeDynamic() { this.style = "dynamic";         },
  makeStatic : function makeStatic()  { this.style = "static";          },
  isDynamic  : function isDynamic()   { return this.style == "dynamic"; },
  isStatic   : function isStatic()    { return !this.isDynamic();       },

  isMultiSelecting: function isMultiSelecting() {
    var kb = Canvas2D.Keyboard;
    return (ProtoJS.Browser.WebKit && (kb.keyDown(91) || kb.keyDown(93))) ||
    ( !ProtoJS.Browser.WebKit && (kb.keyDown(17) || kb.keyDown(19)));
  },

  getHit: function getHit(pos) {
    for( var s = this.positions.length-1; s>=0; s-- ) {
      if( this.positions[s].hit(pos.x,pos.y) ) {
        return this.positions[s];
      }
    }
    return null;
  },

  selectShape: function selectShape(shape, reset) {
    if( reset ) {
      this.selectedShapes = [ shape ];
    } else if( ! this.selectedShapes.contains(shape) ) {
      this.selectedShapes.push(shape);
    }
    this.fireEvent( "shapeSelected", shape );
  },

  hit: function hit(pos) {
    var hit = this.getHit(pos);
    if( hit ) {
      if( this.hasSelectedShapes() ) {
        if( this.selectedShapes.contains( hit ) ) {
          if( this.isMultiSelecting() ) {
            this.selectedShapes.remove(hit);
          } else {
            this.selectedShapes = [];
          } 
        } else {
          this.selectShape(hit, !this.isMultiSelecting());
        }
      } else {
        this.selectShape(hit, true);
      }
    } else {
      this.selectedShapes = [];
    }
  },

  hitArea: function hitArea( left, top, right, bottom ) {
    var newSelection =  this.isMultiSelecting() ? this.selectedShapes : [];
    for( var s = this.positions.length-1; s>=0; s-- ) {
      if( this.positions[s].hitArea(left, top, right, bottom) ) {
        newSelection.push( this.positions[s] );
        this.fireEvent( "shapeSelected", this.positions[s] );
      }
    }
    this.selectedShapes = newSelection.unique();
  },

  handleMouseDown: function handleMouseDown(pos) {
    if( !this.isDynamic() ) { return; }
    this.currentPos = pos;
  },

  handleMouseUp: function handleMouseUp(pos) {
    if( !this.isDynamic() ) { return; }

    if( this.selectingArea ) {
      this.stopSelectingArea()
    } else if( this.draggingSelection ) {
      this.stopDraggingSelection();
      this.selectedShapes.iterate(function(position) {
        this.fireEvent( "shapesMoved",
        "Shape moved to " + 
        position.left + ", " + position.top );
      }.scope(this) );
    } else {
      this.hit(pos);
      this.currentPos = pos;
    }
    this.makeDirty();
  },

  hasSelectedShapes : function hasSelectedShapes() {
    return this.selectedShapes.length > 0;
  },

  startDraggingSelection: function startDraggingSelection(pos) {
    this.draggingSelection = true;
    this.selectingArea = false;
  },

  stopDraggingSelection: function stopDraggingSelection(pos) {
    this.draggingSelection = false;
  },

  startSelectingArea: function startSelectingArea(pos) {
    this.selectingArea = true;
    this.selectionPos  = pos;
    this.draggingSelection = false;
  },

  stopSelectingArea: function stopSelectingArea(pos) {
    this.selectingArea = false;
  },

  handleMouseDrag: function handleMouseDrag(pos) {
    if( !this.isDynamic() ) { return; }

    if( this.selectingArea ) {
      this.hitArea( this.currentPos.x, this.currentPos.y, pos.x, pos.y );
      this.selectionPos  = pos;
    } else if( this.draggingSelection ) {
      this.moveCurrentSelection(pos.dx, pos.dy);
    } else {
      var hit = this.getHit(pos);
      if( hit && this.hasSelectedShapes() && this.selectedShapes.contains(hit) ) {
        this.startDraggingSelection();
      } else if( hit && this.hasSelectedShapes() && !this.selectedShapes.contains(hit) ) {
        if( !this.isMultiSelecting() ) { this.selectedShapes = []; }
        this.hit(pos);
        this.startDraggingSelection();
      } else if( hit && !this.hasSelectedShapes() ) {
        this.hit(pos);
        this.startDraggingSelection();
      } else {
        this.startSelectingArea(pos);
      }
    }

    this.makeDirty();
  },

  selectAllShapes: function() {
    this.selectedShapes = [];
    this.positions.iterate( function(position) { 
      this.selectedShapes.push(position);
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

    // cmd | ctrl + a = select all
    if( ( Canvas2D.Keyboard.keyDown(91) || Canvas2D.Keyboard.keyDown(17) ) &&
    key == 65 && this.canvas.mouseOver )
    {
      this.selectAllShapes();
    }
  },

  addSelectionOverlay: function() {
    if( this.selectingArea ) { 
      var pos = this.selectionPos;
      var dx = pos.x - this.currentPos.x;
      var dy = pos.y - this.currentPos.y;

      this.canvas.fillStyle = "rgba( 0, 0, 255, 0.1 )";
      this.canvas.fillRect( 
        pos.x <= this.currentPos.x ?  pos.x : this.currentPos.x, 
        pos.y <= this.currentPos.y ?  pos.y : this.currentPos.y,
        Math.abs(dx), Math.abs(dy) 
      );
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
        }.scope(this) 
      );
    }.scope(this) );
  },

};

ProtoJS.mix( Canvas2D.DynamicSheet, Canvas2D.Sheet.prototype, true );

// extend existing methods
Class.extendMethod( Canvas2D.Sheet, "clear",  
function clear() { this.selectedShapes = []; }, true );

Class.extendMethod( Canvas2D.Sheet, "afterInit",  
function afterInit() {
  this.clear();
  this.dirty = false;
  Canvas2D.Keyboard.on( "keydown", this.handleKeyDown.scope(this) );
} );

Class.extendMethod( Canvas2D.Sheet, "render",
function render() {
  this.addSelectionOverlay();
  this.addSelectionMarkers();
} );

// add style property
Canvas2D.Sheet.MANIFEST.properties.style = 
Canvas2D.Types.Selection({ values: [ "static", "dynamic" ], asKey: true } );

// re-register Sheet
Canvas2D.registerShape( Canvas2D.Sheet );
