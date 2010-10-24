Canvas2D.Types = {

  Name: Canvas2D.Type.extend( 
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

  Parent : Canvas2D.Type.extend(
    {
      extractFrom: "parent",
      exportToADL: false
    }
  ),

  Size   : Canvas2D.Type.extend(
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

  Text   : Canvas2D.Type.extend(
    {
      validate: function validateText(value) {
        return value.isString();
      }
    }
  ),

  Color  : Canvas2D.Type.extend(
    {
      // TODO add http://www.w3schools.com/html/html_colornames.asp
      validate: function validateColor(value) {
        return [ "aqua", "black", "blue", "fuchsia", "gray", "green", "lime", 
        "maroon", "navy", "olive", "purple", "red", "silver", "teal", 
        "white", "yellow" ].contains(value)        ||
        value.match(/#[a-fA-F0-9]{3}/)             ||
        value.match(/#[a-fA-F0-9]{6}/)             || 
        value.match(/rgb\([0-9]+,[0-9]+,[0-9]+\)/) || 
        value.match(/rgba\([0-9]+,[0-9]+,[0-9]+,[0-9\.]+\)/) ||
        value.match(/[a-zA-Z]+ [0-9\.]+/);
      },
      unpack: function unpackColor(prop, value) {
        // TODO: improve, this is for showcase only
        var props = {};
        var result = new RegExp("([a-zA-Z]+) ([0-9\.]+)").exec(value);
        if( result !== null ) {
          var map = { red: "255,0,0", green: "0,255,0", blue: "0,0,255" };
          value = "rgba(" + map[result[1]] + "," + result[2] + ")";
        }
        props[prop] = value;
        return props;
      }
    }
  ),

  Font   : Canvas2D.Type.extend(
    {
      validate: function validateFont(value) {
        // TODO improve matching
        return value.match(/[0-9]+(px|pt|em) [a-zA-Z\-]+/);
      }
    }
  ),

  Switch : Canvas2D.Type.extend(
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

  Selection : Canvas2D.Type.extend( 
    {
      init : function initSelection(config) {
        config = config || {}; // which is the case with "named" selections
        this._super(config);
        this.values       = config.values || this.values;
        this.extractAsKey = config.asKey; // FIXME: this can be done by Type
      },

      validate   : function validateSelection(value) {
        return this.values.contains(value);
      }
    }
  ),

  Mapper : Canvas2D.Type.extend(
    {
      init : function _constructMapper(config) {
        this._super(config);
        
        this.match = config.match || "";
        this.map   = config.map   || [];
      },

      obsoletes : function obsoletesMapper() {
        return this.map;
      },

      validate: function validateMapper(value) {
        return value && value.match(this.match);
      },

      unpack : function unpackMapper(prop, value) {
        var result = new RegExp(this.match).exec(value);
        var retval = {};
        var c = 1;
        this.map.iterate( function(propName) {
          //print( "extracting " + propName );
          // TODO: retrieve propType from scoped shape's property called propName
          var propType = this.propertiesConfig.get(propName);
          propType.setParent(this.getParent());
          if( propType.validate(result[c]) ) {
            var cleanValue    = propType.sanitize(result[c]);
            var unpackedValue = propType.unpack(propName, cleanValue); 
            retval[propName]  = unpackedValue[propName];
          } else {
            console.log( "invalid : " + propName + " = " + result[c] );
          }
          c++;
        }.scope(this) );
        return retval;
      },

      isVirtual: true,

      createGetter : function createGetter() {
        return function(match_in, map_in) {
          return function(defaultProperty) {
            // TODO: improve naming
            var retval = match_in;
            var props  = map_in;
            var match  = /\([^)]+\)/;
            var valid  = true;
            props.iterate(function(prop) {
              var value = defaultProperty ? 
              this.getPropertyDefault(prop) : this.getProperty(prop);
              if( value === null || typeof value === "undefined" ) {
                valid = false;
              } else {
                retval = retval.replace( match, value );
              }
            }.scope(this) );
            return valid ? retval : null;
          };
        }
        (this.match, this.map);
      }
    }
  ),

  Handler : Canvas2D.Type.extend(
    {
      validate : function validateHandler(value) {
        return value.isFunction();
      }
    }
  ),

  Shape : Canvas2D.Type.extend(
    {
      validate: function validateShape(shapeName) {
        return $H(this.getParent().getContainer().shapesMap)
        .keys().contains(shapeName);
      },

      unpack: function unpackShape(prop, value) {
        var result = {};
        result[prop] = this.getParent().getContainer().shapesMap[value];
        return result;
      }
    }
  ),

  ConnectorHead : Canvas2D.Type.extend(
    {
      validate: function validateConnectorHead(name) {
        return $H(Canvas2D.CustomConnectors).keys().contains(name);
      },

      unpack: function unpackConnectorHead(prop, value) {
        var result = {};
        result[prop] = Canvas2D.CustomConnectors[value]
        return result;
      }
    }
  ),

  URL : Canvas2D.Type.extend(
    {
      validate: function validateURL(url) {
        var regexp = /(\w+:\/\/)?(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
        return regexp.test(url);
      }
    }
  ),

  Position : Canvas2D.Type.extend(
    {
      validate: function validatePosition(value) {
        if( !value ) { return false; }
        return value.match(/-?[0-9\.]+[, ]+-?[0-9\.]+/); // FIXME: improve ;-)
      },

      unpack: function unpackPosition(prop, value) {
        var values = value.split(",");
        var props = {};
        props[prop] = {
          left: parseFloat(values[0]),
          top : parseFloat(values[1])
        };
        return props;
      },

      toString: function toStringPosition(position) {
        return position.left + "," + position.top;
      }
    }
  ),

  List : Canvas2D.Type.extend(
    {
      init : function initList(type) {
        this._super();
        this.type = type;
      },

      validate: function validateList(value) {
        this.values = value.split(";");
        var isValid = true;
        this.values.iterate(function(listValue) {
          if( ! this.type.validate(listValue) ) { isValid = false; }
        }.scope(this) );
        return isValid;
      },

      unpack: function unpackList(prop, value) {
        // validate has been called normally, which has already split value
        // into values, just check to be sure ;-)
        if( ! this.values ) { this.validate(value); }
        var listValues = [];
        this.values.iterate( function(value) {
          var tmp = this.type.unpack(prop, value);
          listValues.push( tmp[prop] );
        }.scope(this) );
        var props = {};
        props[prop] = listValues;
        return props;
      },

      toString: function toStringList(listValues) {
        // validate has been called normally, which has already split value
        // into values, just check to be sure ;-)
        var list = [];
        listValues.iterate( function( value ) {
          list.push( this.type.toString(value) );
        }.scope(this) );
        var string = list.join(";");
        return string;
      }
    }
  )
};

// extended Types

Canvas2D.Types.FontDecoration = Canvas2D.Types.Selection.extend(
  { values: [ "underline", "overline", "line-through", "none" ] } 
);

Canvas2D.Types.LineStyle = Canvas2D.Types.Selection.extend(
  { values: [ "solid", "dashed", "none" ] }
);

Canvas2D.Types.Direction = Canvas2D.Types.Selection.extend(
  { values: [ "n", "nne", "ne", "ene", "e", "ese", "se", "sse",
  "s", "ssw", "sw", "wsw", "w", "wnw", "nw", "nnw"  ] }
);

Canvas2D.Types.Align = Canvas2D.Types.Selection.extend(
  { values: [ "left", "center", "right", "top", "middle", "bottom" ] }
);
