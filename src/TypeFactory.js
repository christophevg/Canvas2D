Canvas2D.TypeFactory = {
  _baseType : Class.extend( {
    _construct: function _construct(data) {
      // TODO: make more generic
      if( data.extractFrom ) { this.extractFrom = data.extractFrom; }
    },
    hasGenerator: function hasGenerator() { return this.generate != null; },
    hasGetter: function hasGetter() { return this.createGetter != null; },
    obsoletes: function obsoletes() { return []; },
    extractFrom : ADL.Modifier,
    extractAsKey : false,
    validate: function validate(value) { return false; },
    setParent: function setParent(parent) { this._parent = parent; },
    getParent: function getParent() { return this._parent },
    extract : function extract(props, prop, construct, parent) {
      this.setParent(parent);
      if( this.extractFrom == ADL.Modifier ) {
        this._extractModifier(props, prop, construct);
      } else if( this.extractFrom == ADL.Annotation ) {
        this._extractAnnotation(props, prop, construct);
      } else if( this.extractFrom == "ADL.Value" ) { // FIXME ;-)
        props[prop] = construct.value.value;
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
      construct.getAnnotations().iterate(function(annotation) {
      	if( this.validate(annotation) ) {
        	$H(this.unpack(prop, this.sanitize(annotation))).iterate(function(key,value) {
          	props[key] = value;
        	});
				}
      }.scope(this) );
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

  extend: function(builder) {
    return function() { return builder; };
  },

  createType: function(specifics) {
    specifics = specifics || {};
    var newType = Canvas2D.TypeFactory._baseType.extend( specifics );
    return function(data) { 
      var instance = new newType(); 
      if( data ) { instance._construct(data); }
      return instance;
    };
  }
};
