Canvas2D.TypeFactory = {
  _baseType : Class.extend( {
    hasGenerator: function hasGenerator() { return this.generate != null; },
    hasGetter: function hasGetter() { return this.createGetter != null; },
    obsoletes: function obsoletes() { return []; },
    extractFrom : ADL.Modifier,
    extractAsKey : false,
    validate: function validate(value) { return false; },
    extract : function extract(props, prop, construct, parent) {
      this.parent = parent; // normally this will be a sheet
      if( this.extractFrom == ADL.Modifier ) {
        this._extractModifier(props, prop, construct);
      } else if( this.extractFrom == ADL.Annotation ) {
        this._extractAnnotation(props, prop, construct);
      } else if( this.extractFrom == "name" ) {
        props[prop] = construct.name;
      } else if( this.extractFrom == "parent" ) {
        props[prop] = parent;
      } else {
        console.log( "WARNING: Unknown extraction location: " + this.extractFrom + " for property " + prop );
      }
    },

    sanitize: function sanitize(value) { return value; },

    unpack: function unpack(prop, value) { 
      var retval = {}; 
      retval[prop] = value; 
      return retval; 
    },

    isVirtual : false,

    _extractAnnotation: function _extractAnnotation(props, prop, construct) {
      var annotation = construct.annotation.data;
      if( this.validate(annotation) ) {
        $H(this.unpack(prop, this.sanitize(annotation))).iterate(function(key,value) {
          props[key] = value;
        });
      }
    },

    _extractModifier: function _extractModifier(props, prop, construct) {
      var modifier = construct.modifiers.get(prop);
      if( modifier ) {
        var value = modifier.value ? modifier.value.value : modifier.value;
        if( this.validate(value) ) {
          $H(this.unpack(prop, this.sanitize(value))).iterate(function(key,value) {
            props[key] = value;
          });
          return;
        }
      }

      var keyValue = null;
      if( this.extractAsKey ) {
        construct.modifiers.iterate(function(value, modifier) {
          if( this.validate(value) ) {
            $H(this.unpack(prop, this.sanitize(value))).iterate(function(key,value) {
              props[key] = value;
            });
            return;
          }
        }.scope(this) );
      }

    }
  } ),

  createType: function(specifics) {
    var newType = this._createSimpleType(specifics);
    if( newType.prototype._construct ) {
      return function(data) { 
        var instance = new newType(); 
        instance._construct(data);
        return instance;
      };
    }
    return new newType();
  },

  _createSimpleType: function _createSimpleType(type) {
    type = type || {};
    return Canvas2D.TypeFactory._baseType.extend( type );
  }
};
