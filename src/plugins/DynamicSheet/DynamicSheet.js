/**
* DynamicSheet plugin
*
* This plugin extends Sheet with interactive capabilities:
* - selection of shapes
* - moving them around
* - resizing them using the selection handles
*
* Selection Handles are built using Shapes themselves.
*/

// extend book to pass mouse events to sheet
Canvas2D.DynamicBook = {};

Canvas2D.DynamicBook.setupMouseEventHandling = function setupMouseEventHandling() {
	if( ! this.canvas ) { return; } // no canvas available, using cli ?!
  [ "MouseDown", "MouseUp", "MouseDrag" ].iterate( function(ev) {
    this.canvas.on( ev.toLowerCase(), function(data) {
      this.fireEvent( ev.toLowerCase() );
      var sheet = this.getCurrentSheet();
      if( sheet ) {
        sheet["handle"+ev](data);
      }
    }.scope(this) );
  }.scope(this) );
};

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

  hit: function hit(pos) {
    var shape = this.getHit(pos);
    if( shape ) {
      if( this.selection.hasSelectedShapes() ) {
        console.log( "** has selected shapes" );
        if( this.selection.contains( shape ) ) {
          console.log( "** hit is already in selection" );
          if( this.isMultiSelecting() ) {
            console.log( "** removing from multiselect" );
            this.selection.removeShape(shape);
          } else {
            console.log( "** removing all == stop multiselection" );
            this.selection.removeAllShapes();
          } 
        } else {
          console.log( "** hit is not in current selection" );
          if( this.isMultiSelecting() ) {
            console.log( "** adding to multiselection" );
            this.selection.addShape(shape);
          } else {
            console.log( "** reset to new single selection" );
            this.selection.addOnlyShape(shape);
          }
        }
      } else {
        console.log( "** first selection" );
        this.selection.addShape(shape);
      }
    } else {
      console.log( "** blank hit" );
      this.selection.removeAllShapes();
    }
  },

  hitArea: function hitArea( from, to ) {
    if( ! this.isMultiSelecting() ) { this.selection.removeAllShapes(); }

    for( var s = this.positions.length-1; s>=0; s-- ) {
      if( this.positions[s].hitArea(from.x, from.y, to.x, to.y) ) {
        this.selection.addShape( this.positions[s] );
      }
    }
  },

  handleMouseDown: function handleMouseDown(pos) {
    if( !this.isDynamic() ) { return; }
    this.currentPos = pos;
    var shape = this.getHit(pos);
    if( shape ) { shape.shape.getOnMouseDown()(); }
  },

  handleMouseUp: function handleMouseUp(pos) {
    if( !this.isDynamic() ) { return; }

    var shape = this.getHit(pos);
    if( shape ) { shape.shape.getOnMouseUp(); }

    if( this.selectingArea ) {
      this.stopSelectingArea();
    } else if( this.draggingSelection ) {
      this.stopDraggingSelection();
      this.selection.getSelectedShapes().iterate(function(position) {
        this.fireEvent( "shapesMoved",
        "Shape moved to " + 
        position.left + ", " + position.top );
      }.scope(this) );
    } else if( this.resizingSelection ) {
      this.stopResizingSelection();
    } else {
      this.hit(pos);
      this.currentPos = pos;
    }
    this.makeDirty();
  },

  startDraggingSelection: function startDraggingSelection(pos) {
    this.draggingSelection = true;
    this.selectingArea = false;
  },

  stopDraggingSelection: function stopDraggingSelection(pos) {
    this.draggingSelection = false;
  },
  
  startResizingSelection: function startResizingSelection(pos) {
    this.resizingSelection = true;
  },

  stopResizingSelection: function stopResizingSelection(pos) {
    this.resizingSelection = false;
  },

  startSelectingArea: function startSelectingArea(pos) {
    this.selectingArea = true;
    this.draggingSelection = false;
    this.selectionPos  = pos;
    this.selectionOverlay.show();
  },

  stopSelectingArea: function stopSelectingArea(pos) {
    this.selectingArea = false;
    this.selectionOverlay.hide();
  },

  handleMouseDrag: function handleMouseDrag(pos) {
    if( !this.isDynamic() ) { return; }

    this.currentPos = pos;
    if( this.selectingArea ) {
      this.hitArea( this.selectionPos, this.currentPos );
      this.selectionOverlay.set( this.selectionPos, this.currentPos );
    } else if( this.draggingSelection ) {
      this.selection.move(pos.dx, pos.dy);
    } else if( this.resizingSelection ) {
      this.selection.resize(pos.dx, pos.dy);
    } else {
      // check if shape doesn't want to be only selectShape
      // (aka the selection stealing shape)
      var hit = this.getHit(pos);
      if( hit ) { 
        if( hit.shape.getOnMouseDrag()(this, pos.dx, pos.dy) ) { 
          this.selection.addOnlyShape(hit);
          this.startDraggingSelection();
          return;
        }
      }
      var shape = this.getHit(pos);
      if( shape && this.selection.hasSelectedShapes() && this.selection.contains(shape) ) {
        this.startDraggingSelection();
      } else if( shape && this.selection.hasSelectedShapes() && !this.selection.contains(shape) ) {
        if( !this.isMultiSelecting() ) { this.selection.removeAllShapes(); }
        this.hit(pos);
        this.startDraggingSelection();
      } else if( shape && !this.selection.hasSelectedShapes() ) {
        this.hit(pos);
        this.startDraggingSelection();
      } else {
        this.startSelectingArea(pos);
      }
    }

    this.makeDirty();
  },

  selectAllShapes: function() {
    // all positions, not yet included: connectors
    this.positions.iterate( this.selection.addShape.scope(this) );
    this.makeDirty();
  },

  handleKeyDown: function(key) {
    if( Canvas2D.Keyboard.keyDown(16) ) { // shift + 
      switch(key) {
        case 37: this.selection.move( -5,  0 ); break; // left
        case 38: this.selection.move(  0, -5 ); break; // up
        case 39: this.selection.move(  5,  0 ); break; // right
        case 40: this.selection.move(  0,  5 ); break; // down
      }
    }

    // cmd | ctrl + a = select all
    if( ( Canvas2D.Keyboard.keyDown(91) || Canvas2D.Keyboard.keyDown(17) ) &&
    key == 65 && this.canvas.mouseOver )
    {
      this.selectAllShapes();
    }
  }
};

ProtoJS.mix( Canvas2D.DynamicSheet, Canvas2D.Sheet.prototype, true );

// extend existing methods
Class.extendMethod( Canvas2D.Sheet, "clear",  
function clear() { this.selection.removeAllShapes(); }, true );

Class.extendMethod( Canvas2D.Sheet, "afterInit",  
function afterInit() {
  this.selection = new Canvas2D.DynamicSheet.Selection(this);
  this.selectionOverlay = new Canvas2D.DynamicSheet.Selection.Overlay(this);

  this.clear();
  this.dirty = false;
  Canvas2D.Keyboard.on( "keydown", this.handleKeyDown.scope(this) );
} );

// add style property
Canvas2D.Sheet.MANIFEST.properties.style = 
	Canvas2D.Types.Selection({ values: [ "static", "dynamic" ], asKey: true } );

// re-register Sheet to add new properties/getters/setters
Canvas2D.reRegisterShape( Canvas2D.Sheet );
