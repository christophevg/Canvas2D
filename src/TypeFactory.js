Canvas2D.TypeFactory = {
  _baseType : {
    hasGenerator: function hasGenerator() { return this.generate != null; },
    hasGetter: function hasGetter() { return this.createGetter != null; },
    obsoletes: function obsoletes() { return []; },
    extractFrom : ADL.Modifier,
    extractAsKey : false,
    validate: function validate(value) { return false; },
    extract : function extract(props, prop, construct, parent) {
      if( this.extractFrom == ADL.Modifier ) {
        this._extractModifier(props, prop, construct);
      } else if( this.extractFrom == "name" ) {
        props[prop] = construct.name;
      } else if( this.extractFrom == "parent" ) {
        props[prop] = parent;
      } else {
        console.log( "WARNING: Unknown extraction location: " + this.extractFrom );
      }
    },

    sanitize: function sanitize(value) { return value; },

    unpack: function unpack(prop, value) { 
      var retval = {}; 
      retval[prop] = value; 
      return retval; 
    },

    isVirtual : false,

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
        construct.modifiers.iterate(function(key, modifier) {
          if( this.validate(key) ) {
            keyValue = key;
          }
        }.scope(this) );
      }

      if( ! this.isVirtual ) {
        props[prop] = keyValue;
      }
    }
  },

  createType: function(specifics) {
    var newType = this._createSimpleType(specifics);
    if( newType._construct ) {
      return function(data) { newType._construct(data); return newType; };
    }
    return newType;
  },

  _createSimpleType: function _createSimpleType(type) {
    type = type || {};
    var newType = {};
    ProtoJS.mix( Canvas2D.TypeFactory._baseType, newType );
    ProtoJS.mix( type, newType, true );
    return newType;
  }
};
