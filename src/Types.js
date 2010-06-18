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
        this._values      = config.values;
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
        if( config.extractFrom ) { this.extractFrom  = config.extractFrom; }
        if( config.asKey       ) { this.extractAsKey = config.asKey;       }
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
          retval[propName] = propType.unpack(propName, propType.sanitize(result[c++]))[propName];
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
  ),

  Handler : Canvas2D.TypeFactory.createType(
    {
      validate : function validateHandler(value) {
        return value.isFunction();
      }
    }
  ),
  
  Shape : Canvas2D.TypeFactory.createType(
    {
      validate: function validateShape(shapeName) {
        return this.parent instanceof Canvas2D.Sheet && 
               $H(this.parent.shapesMap).keys().contains(shapeName);
      },
      
      unpack: function unpackShape(prop, value) {
        var result = {};
        result[prop] = this.parent.shapesMap[value];
        return result;
      }
    }
  ),
  
  ConnectorHead : Canvas2D.TypeFactory.createType(
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
  )
};

// extended Types

Canvas2D.Types.FontDecoration = Canvas2D.Types.Selection(
  { values: [ "underline", "overline", "line-through", "none" ] } 
);

Canvas2D.Types.LineStyle = Canvas2D.Types.Selection(
  { values: [ "solid", "dashed", "none" ] } 
);

Canvas2D.Types.Direction = Canvas2D.Types.Selection(
  { values: [ "n", "nne", "ne", "ene", "e", "ese", "se", "sse",
              "s", "ssw", "sw", "wsw", "w", "wnw", "nw", "nnw"  ] }
);

Canvas2D.Types.Align = Canvas2D.Types.Selection(
  { values: [ "left", "center", "right", "top", "middle", "bottom" ] }
);
