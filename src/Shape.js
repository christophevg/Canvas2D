Canvas2D.Shape = Class.extend( {
  init: function initialize( props ) {
    // beforeInit is used to allow Shapes to preprocess the
    // properties before they are automatically initialized
    props = this.beforeInit(props || {});

    // process all input properties into actual properties
    this.setProperties(props);

    // afterInit is used to allow Shapes to do initialization
    // stuff, without the need to override this construtor and
    // make sure it is called correctly
    this.afterInit();
  },

  preprocess: function preprocess(props) {
    console.log( "WARNING: preprocess is deprecated. please use beforeInit.");
    this.beforeInit(props);
  },

  postInitialize: function postInitialize() {
    console.log( "WARNING: postInitialize is deprecated. please use afterInit.");
    this.afterInit(props);
  },

  setParent: function setParent(parent) {
    this.parent = parent;
  },

  getParent: function getParent() {
    return this.parent;
  },

  setProperties : function setProperties(props) {
    // process each property in the propertyList
    this.getPropertyList().iterate(
      function propertyListIterator(prop) {
        this.setProperty(prop, props[prop]);
      }.scope(this) 
    );
  },

  setProperty : function setProperty(prop, value) {
    var config = this.getPropertiesConfig().get(prop);
    if( config.isVirtual ) { return; }
    this[prop] = value != null ? value : 
    ( config.hasGenerator() ? config.generate(this) : null );
  },

  getProperty: function getProperty( prop ) {
    if( typeof this[prop] == "undefined" ) {
      var propName = prop.substr(0,1).toUpperCase() + prop.substr(1);
      var getterName = "get"+propName;
      return this[getterName]();
    } else {
      return this[prop] != null ? 
      this[prop] : this.getPropertyDefault(prop);
    }
  },

  getPropertyDefault: function getPropertyDefault(prop) {
    var retVal = null;
    this.getClassHierarchy().reverse().iterate( 
      function classHierarchyIterator(clazz) {
        if( retVal == null && typeof clazz.Defaults[prop] != "undefined" ) {
          retVal = clazz.Defaults[prop];
        }
      }
    );
    return retVal;
  },

  toADL: function(prefix) {
    return this.constructToString(this.asConstruct(), prefix);
  },

  asConstruct: function() {
    var construct =  
    { __SHAPE__   : this,
      annotation  : { data: null },
      type        : this.getType(),
      name        : this.getName(),
      supers      : [],
      modifiers   : {},
      children    : [],
      addModifiers: function( props ) {
        var remove = [];
        props.iterate( function(prop, config) {
          if( prop == "name" ) { return; }
          if( this.__SHAPE__.getProperty( prop ) ) {
            this.addModifier( prop, this.__SHAPE__.getProperty(prop) );
          }
          remove = remove.concat(config.obsoletes());
        }.scope(this) );
        remove.iterate(function(modifier) { 
          delete this.modifiers[modifier];
        }.scope(this) );
      },
      addModifier : function( key, value ) {
        if( this.__SHAPE__.getPropertyDefault( key ) != value ) {
          if( typeof value == "boolean" ) {
            if( value ) {
              this.modifiers[key] = null;
            } else {
              this.modifiers[key] = "false";
            }
          } else if( value.isNumber() ) {
            this.modifiers[key] = value;
          } else {
            this.modifiers[key] = "\"" + value + "\"";
          }
        }
      }
    };

    construct.addModifiers( this.getPropertiesConfig() );

    return construct;
  },

  constructToString: function(construct, prefix) {
    if(construct == null) { return ""; }
    var string = "";
    if( construct.annotation && construct.annotation.data ) {
      string += prefix + "[@" + construct.annotation.data + "]\n";
    }
    string += prefix + construct.type + " " + construct.name;
    construct.supers.iterate(function(zuper) { string += " : " + zuper; });
    $H(construct.modifiers).iterate( 
      function modifierIterator( key, value ) {
        if( typeof value != "function" ) {
          string += " +" + key;
          if( value ) { string += "=" + value; }
        }
      } 
    );
    if( construct.children.length > 0 ) {
      string += " {\n";
      var me = this;
      construct.children.iterate(function childIterator(child) {
        string += me.constructToString(child, prefix + "  " ) + "\n";
      } );
      string += prefix + "}";
    } else {
      string += ";";
    }
    return string;
  },

  delayRender: function() {
    return false;
  },

  drawLabel: function(sheet, left, top) {
    if( this.getLabel() && this.getHeight() != null && this.getCenter() ) {
      left += this.getCenter().left;

      switch( this.getLabelPos() ) {
        case "top":	            top  += - 5;   break;
        case "top-inner":       top  += + 16;  break;
        case "bottom":          top  += this.getHeight() + 11; break;
        case "bottom-inner":    top  += this.getHeight() - 8;  break;
        case "center": default: top  += this.getCenter().top + 2.5;
      }

      sheet.save();
      sheet.fillStyle     = this.getLabelColor();
      sheet.textAlign     = this.getLabelAlign();
      sheet.font          = this.getLabelFont();
      sheet.useCrispLines = this.getLabelUseCrispLines();
      sheet.fillText(this.getLabel(), left, top);
      sheet.restore();
    }
  },

  render: function render(sheet, left, top) {
    if( ! this.getIsVisible() ) { return; }
    this.beforeRender(sheet);
    
    sheet.save();
    this.draw     (sheet, left, top);
    this.drawLabel(sheet, left, top);
    sheet.restore();
    
    this.afterRender(sheet);
  },
  
  beforeRender: function prepare(sheet) {},
  afterRender : function prepare(sheet) {},

  getCenter: function() {
    return { left: this.getWidth()  / 2, top:  this.getHeight() / 2 };
  },

  getPort: function(side) {
    var modifiers = { 
      nw:  { left: 0,    top: 0   },
      nnw: { left: 0.25, top: 0   },
      n  : { left: 0.5,  top: 0   }, 
      nne: { left: 0.75, top: 0   },
      ne : { left: 1,    top: 0   },
      ene: { left: 1,    top: 0.25},
      e  : { left: 1,    top: 0.5 },
      ese: { left: 1,    top: 0.75},
      se : { left: 1,    top: 1   },
      sse: { left: 0.75, top: 1   },
      s  : { left: 0.5,  top: 1   },
      ssw: { left: 0.25, top: 1   },
      sw:  { left: 0,    top: 1   },
      wsw: { left: 0,    top: 0.75},
      w  : { left: 0,    top: 0.5 },
      wnw: { left: 0,    top: 0.25} 
    };

    if (!modifiers[side]) {
      return { left: 0, top: 0 };
    }

    return { 
      left: modifiers[side].left * this.getWidth(),
      top:  modifiers[side].top  * this.getHeight() 
    };
  },

  hit: function(x,y) {
    return ( this.getWidth() >= x && this.getHeight() >= y );
  },

  hitArea: function(left, top, right, bottom) {
    return ! ( 0 > right     ||
      this.getWidth() < left ||
      0 > bottom             ||
      this.getHeight() < top 
    );
  },

  // the remaining methods are not applicable for abstract shapes
  beforeInit : function beforeInit(props)      { return props; },
  afterInit  : function afterInit()            { },
  draw       : function draw(sheet, left, top) { }
} );

// add-in some common functionality
ProtoJS.mix( 
  Canvas2D.Factory.extensions.all.EventHandling,
  Canvas2D.Shape.prototype 
);

Canvas2D.Shape.MANIFEST = {
  name : "shape",
  properties: {
    name               : Canvas2D.Types.Name,
    width              : Canvas2D.Types.Size,
    height             : Canvas2D.Types.Size,
    label              : Canvas2D.Types.Text,
    labelPos           : Canvas2D.Types.Align,
    labelColor         : Canvas2D.Types.Color,
    labelAlign         : Canvas2D.Types.Align,
    labelFont          : Canvas2D.Types.Font,
    labelUseCrispLines : Canvas2D.Types.Switch,
    useCrispLines      : Canvas2D.Types.Switch,
    geo                : Canvas2D.Types.Mapper( 
      { 
        map : "([0-9]+)x([0-9]+)", 
        to  : 
        { 
          "width"  : Canvas2D.Types.Size, 
          "height" : Canvas2D.Types.Size 
        } 
      }
    ),
    isSelectable      : Canvas2D.Types.Switch,
    isVisible         : Canvas2D.Types.Switch,
    hideSelection     : Canvas2D.Types.Switch,
    onMouseDown       : Canvas2D.Types.Handler,
    onMouseUp         : Canvas2D.Types.Handler,
    onMouseDrag       : Canvas2D.Types.Handler
  }
};

Canvas2D.Shape.manifestHandling = $H( {
  getManifest: function getManifest() {
    return this.MANIFEST || this.__CLASS__.MANIFEST;
  },

  getType: function getType() {
    return this.getManifest().name;
  },

  getTypes: function getTypes() {
    return [ this.getType() ].concat( this.getAliasses() );
  },

  getPropertyPath: function getPropertyPath() {
    return this.getManifest().propertyPath || [];
  },

  getClassHierarchy: function getClassHierarchy() {
    var classes = [ Canvas2D.Shape ].concat( this.getPropertyPath() );
    classes.push( this.__CLASS__ || this );
    return classes;
  },

  getLocalProperties: function getLocalProperties() {
    return $H(this.getManifest().properties).keys() || [];
  },

  getPropertyList: function getPropertyList() {
    if( !this.allPropertiesCache ) { 
      this.allPropertiesCache = [];
      this.getClassHierarchy().iterate(
        function propertiesCacheFiller(shape){
          this.allPropertiesCache = this.allPropertiesCache
          .concat(shape.getLocalProperties());
        }.scope(this)
      );
    }
    return this.allPropertiesCache;
  },

  getLocalPropertiesConfig: function getLocalPropertiesConfig() {
    return $H(this.getManifest().properties);
  },

  getPropertiesConfig: function getPropertiesConfig() {
    if( !this.allPropertiesConfigCache ) {
      this.allPropertiesConfigCache = $H();
      this.getClassHierarchy().iterate(
        function propertiesCacheFiller(shape){
          shape.getLocalPropertiesConfig().iterate( 
            function(prop, config) {
              this.allPropertiesConfigCache.set(prop,config); 
            }.scope(this)
          );
        }.scope(this)
      );
    }
    return this.allPropertiesConfigCache;
  },

  getAliasses: function getAliasses() {
    return this.getManifest().aliasses || [];
  },

  getLibraries: function getLibraries() {
    return this.getManifest().libraries || [];
  }
} );

// add manifestHandling functions to each Shape instance
Canvas2D.Shape.manifestHandling.iterate( function(key, value) {
  Canvas2D.Shape.prototype[key] = value;
} );

// during registerShape the manifestHandling functions are also added to the 
// class itself as static methods
Canvas2D.registerShape(Canvas2D.Shape);

Canvas2D.Shape.Defaults = {
  name               : "newShape",
  useCrispLines      : true,
  label              : "",
  labelFont          : "7pt Sans-Serif",
  labelAlign         : "center",
  labelPos           : "center",
  labelColor         : "black",
  labelUseCrispLines : false,
  isSelectable       : true,
  hideSelection      : false,
  isVisible          : true,
  onMouseDown        : function() {},
  onMouseUp          : function() {},
  onMouseDrag        : function() {},
  onMove             : function() {}
};
