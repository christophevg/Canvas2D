Canvas2D.ADLVisitor = Class.extend( {
  init: function() {
    this.errors = [];  
  },

  visit: function( construct, parent ) {
    var constructType = construct.type.toLowerCase();
    if( constructType == "root" ) {
      // just move on to the children
      construct.childrenAccept(this, parent);
      return parent;
    } else if( Canvas2D.shapes.get(constructType) ) {
      var shape = Canvas2D.shapes.get(constructType).from(construct, parent);
      if( shape ) {
        if( shape.errors ) {
          shape.errors.iterate( function( error ) {
            this.errors.push( error );
          }.scope(this) );
        } else {
          if( shape.warnings ) {
            shape.warnings.iterate( function( error ) {
              this.errors.push( error );
            }.scope(this) );
          }
          var left, top;
          if( construct.annotation ) {
            var pos = construct.annotation.data.split(",");
            left = parseInt(pos[0]);
            top  = parseInt(pos[1]);
            parent.at(left,top).add( shape );
          } else {
            parent.add( shape );
          }
          construct.childrenAccept(this, shape);
        }
      }
      return construct;
    } else {
      this.errors.push("Unknown Construct Type: " + construct.type);
      // if we don't know the construct type, no need to go further
      return parent;
    }
  }
} );
