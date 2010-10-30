Canvas2D.Type = Class.extend( {
  init: function init(data) {
    data = data || {};
    $H({ 
      extractFrom  : ADL.Modifier,
      extractAsKey : false,
      exportToADL  : true,
      isVirtual    : false 
    } ).iterate( function(prop, defaultValue) {
      this[prop] = typeof data[prop] != "undefined" ? 
                    data[prop] :
                   ( typeof this[prop] != "undefined" ? 
                      this[prop] : defaultValue );
    }.scope(this) );
  },

  setPropertiesConfig : function setShape(config) {
    this.propertiesConfig = config;
  },

  hasGenerator     : function hasGenerator() {
    return typeof this.generate == "function";
  },
  hasGetter        : function hasGetter() {
    return typeof this.createGetter == "function";
  },
  hasDefaultGetter : function hasDefaultGetter() {
    return typeof this.createDefaultGetter == "function";
  },
  
  obsoletes   : function obsoletes() { return []; },
  validate    : function validate(value) { return false; },
  setParent   : function setParent(parent) { this._parent = parent; },
  getParent   : function getParent() { return this._parent },

  sanitize : function sanitize(value) { return value; },
  unpack   : function unpack(prop, value, scope) { 
    var retval = {}; 
    retval[prop] = value; 
    return retval; 
  },

  extract : function extract(props, prop, construct, parent) {
    this.setParent(parent);
    if( this.extractFrom == ADL.Modifier ) {
      this._extractModifier(props, prop, construct);
    } else if( this.extractFrom == ADL.Annotation ) {
      this._extractAnnotation(props, prop, construct);
    } else if( this.extractFrom == ADL.Value ) { 
      props[prop] = construct.getValue() != null ? 
      construct.getValue().getValue() : ""; // value of the Value
    } else if( this.extractFrom == "name" ) {
      props[prop] = construct.name;
    } else if( this.extractFrom == "parent" ) {
      props[prop] = parent;
    } else {
      console.log( "WARNING: Unknown extraction location: " + this.extractFrom + " for property " + prop );
    }
  },

  _extractAnnotation: function _extractAnnotation(props, prop, construct) {
    construct.getAnnotations().iterate(function(annotation) {
      if( this.validate(annotation.getValue()) ) {
        $H(this.unpack(prop, this.sanitize(annotation.getValue())))
        .iterate(function(key,value) 
        {
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
          //print( "adding " + key + " = " + value );
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
  },

  insert: function insert(prop, value, construct) {
    if( typeof value == "object" ) { value = this.toString(value); }
    if( this.extractFrom == ADL.Modifier ) {
      if( this.extractAsKey ) {
        construct.addModifier( value );
      } else {
        // FIXME: is this the right location to do this ?
        if( value.isString && value.isString() ) { value = new ADL.String(value); }
        construct.addModifier( prop, value );					
      }
    } else if( this.extractFrom == ADL.Annotation ) {
      construct.addAnnotation(value);
    } else if( this.extractFrom == ADL.Value ) { 
      // FIXME: is this the right location to do this ?
      if( value.isString && value.isString() ) { value = new ADL.String(value); }
      construct.setValue(value);
    } else if( this.extractFrom == "name" ) {
      construct.setName( value );
    } else if( this.extractFrom == "parent" ) {
      console.log( "WARNING: extractFrom parent should not be emitted" );
      console.log( "         for " + prop );
    } else {
      console.log( "WARNING: Unknown extraction location: " + this.extractFrom + " for property " + prop );
    }
  }
} );
