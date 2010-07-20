Canvas2D.ADLVisitor = Class.extend( {
  init: function() {
    this.errors = [];  
  },

  visit: function( construct, parent ) {
    if( construct.getName() == "root" ) {
      construct.childrenAccept(this, parent);  // just move on to the children
      return parent;
    } 

    var shape = Canvas2D.ShapeFactory.createShape(construct, parent);
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

				var props = {};
        // TODO: reuse one instance
				new Canvas2D.Types.Position( { extractFrom: ADL.Annotation } )
					.extract( props, 'position', construct );
        if( props.position ) {
          parent.at(props.position.left, props.position.top).add( shape );
        } else {
          parent.add( shape );
        }
        construct.childrenAccept(this, shape);
      }
      return construct;
    } 

    this.errors.push("Unknown Construct Type: " + construct.type);
    // if we don't know the construct type, no need to go further
    return parent;
  }
} );
