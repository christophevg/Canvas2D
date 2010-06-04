Canvas2D.Types = {

  Name: Canvas2D.TypeFactory.createType( 
    { 
      _shapeCounter : {},
      generate: function generateName( shape ) {
        var name = shape.getPropertyDefault( 'name' ) || "__shape__";
        if( ! this._shapeCounter[name] ) {
          this._shapeCounter[name] = 0;
        }
        name += this._shapeCounter[name]++;
        return name;
      },
      extractFrom: "name"
    }
  ),

  Parent : Canvas2D.TypeFactory.createType(
    {
      extractFrom: "parent"
    }
  ),

  Size   : Canvas2D.TypeFactory.createType(
    {
      sanitize: function sanitizeSize(value) {
        return parseFloat(value);
      },
      validate: function validateSize(value) {
        var numValue = this.sanitize(value);
        return numValue == value && numValue.isNumber() && numValue > 0;
      }
    }
  ),

  Text   : Canvas2D.TypeFactory.createType(
    {
      validate: function validateText(value) {
        return value.isString();
      }
    }
  ),

  Align  : Canvas2D.TypeFactory.createType(
    {
      validate: function validateAlign(value) {
        return [ "left", "center", "right", "top", "middle", "bottom" ]
        .contains(value);
      }
    }
  ),

  Color  : Canvas2D.TypeFactory.createType(
    {
      // TODO add http://www.w3schools.com/html/html_colornames.asp
      validate: function validateColor(value) {
        return [ "aqua", "black", "blue", "fuchsia", "gray", "green", "lime", 
        "maroon", "navy", "olive", "purple", "red", "silver", "teal", 
        "white", "yellow" ].contains(value)        ||
        value.match(/#[a-fA-F0-9]{3}/)             ||
        value.match(/#[a-fA-F0-9]{6}/)             || 
        value.match(/rgb\([0-9]+,[0-9]+,[0-9]+\)/) || 
        value.match(/rgba\([0-9]+,[0-9]+,[0-9]+,[0-9\.]+\)/);
      }
    }
  ),

  Font   : Canvas2D.TypeFactory.createType(
    {
      validate: function validateFont(value) {
        // TODO improve matching
        return value.match(/[0-9]+(px|pt|em) [a-zA-Z\-]+/);
      }
    }
  ),

  Switch : Canvas2D.TypeFactory.createType(
    {
      sanitize: function sanitizeSwitch(value) {
        if( [ true, "true", "yes", "on" ].contains(value) ||
        typeof value == "undefined" ) { return true; }
        return false;
      },

      validate: function validateSwitch(value) {
        return [ true, false, "true", "false", "yes", "no", "on", "off" ]
        .contains(value) || typeof value == "undefined";
      }
    }
  ),

  Selection : Canvas2D.TypeFactory.createType( 
    {
      _construct : function _constructSelection(config) {
        this._values = config.values;
        this.extractAsKey = config.asKey;
      },

      validate   : function validateSelection(value) {
        return this._values.contains(value);
      }
    }
  ),

  Mapper : Canvas2D.TypeFactory.createType(
    {
      _construct : function _constructMapper(config) {
        this._regexp = config.map;
        this._props  = $H(config.to);
      },

      obsoletes : function obsoletesMapper() {
        return this._props;
      },

      validate: function validateMapper(value) {
        return value.match(this._regexp);
      },

      unpack : function unpackMapper(prop, value) {
        var result = new RegExp(this._regexp).exec(value);
        var retval = {};
        var c = 1;
        this._props.iterate( function(propName, propType) {
          retval[propName] = propType.sanitize(result[c++]);
        } );
        return retval;
      },

      isVirtual: true,

      createGetter : function createGetter() {
        return function(retval_in, props_in) {
          return function() {
            var retval = retval_in;
            var props  = props_in;
            var match  = /\([^)]+\)/;
            props.iterate(function(prop) {
              retval = retval.replace( match, this.getProperty(prop) );
            }.scope(this) );
            return retval;
          };
        }
        (this._regexp, this._props);
      }
    }
  )
};
