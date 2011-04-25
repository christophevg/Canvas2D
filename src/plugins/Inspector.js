Canvas2D.Inspector = Class.extend( {
  init: function init(book) {
    this.book = book;
    this.initSheets();
  },

  initSheets: function initSheets() {
    this.sheets = {};
    this.sheetPositions = [];

    this.console = document.createElement('textarea');
    this.addSheet(0, 'console', this.console );

    this.addSheet(1, 'about');
  },

  activate: function activate() {
    this.insertInspector();
    this.wireActivation();
    // if the widget plugin was already loaded before, let it look for 
    // components once more to find our newly created elements
    var widget = this.book.getPlugin( "Widget" );
    if( widget ) { widget.setupComponents(); }
    this.book.logInfo( "Activated Inspector for " + this.book.getName() );
  },
  
  getElement : function getElement(name) {
    return document.getElementById( "inspector_" + name + 
                                    "_for_" + this.book.getName() );
  },

  /**
   * Provides the sheet for the given label.
   * @param label a label
   * @return the sheet with the given label
   */
  getSheet: function getSheet(label) {
    return this.sheets[label];
  },

  /**
   * Adds a sheet to the inspector.
   * Shifts the element currently at that position (if any) and 
   * any subsequent elements to the right (adds one to their indices).
   * @param index at which the specified sheet is to be inserted
   * @param label a label for the sheet
   * @param element the html element representing the content of the sheet
   */
  addSheet: function addSheet(index, label, element) {
    var sheet = new Canvas2D.Inspector.Sheet(label, element);
    this.sheetPositions.splice(index, 0, sheet);
    this.sheets[sheet.getLabel()] = sheet;
  },

  /**
  * Removes the sheet with the given label.
  * @param label a label
  */
  removeSheet: function removeSheet(label) {
    this.sheetPositions.splice(
      this.sheetPositions.indexOf(this.getSheet(label)), 1);
    delete this.sheets[label];
  },
  
  getDefaultTab: function getDefaultTab() {
    return this.defaultTab || "console";
  },
  
  setDefaultTab: function setDefaultTab(tab) {
    this.defaultTab = tab || "console";
  },

  insertInspector: function insertInspector() {
    this.insertInspectorHTML();
    this.wireResizeAndDragHandling();

    this.setupSheets();
    this.gotoTab(this.getDefaultTab());

    this.resizeTo(0,0);
    this.moveTo( this.book.getLeft(), this.book.getTop() );
    this.shownBefore = false;
  },
  
  insertInspectorHTML: function insertInspectorHTML() {
    this.inspector = document.createElement("DIV");
    this.inspector.id = "inspector_for_" + this.book.getName();
    this.inspector.className = "inspector";
    this.inspector.innerHTML = 
    '<table class="inspector_header" width="100%" border="0" ' +
           'cellspacing="0" cellpadding="0"><tr>' +
    '<td class="inspector_close" ' +
    'onclick="this.parentNode.parentNode.' +
    'parentNode.parentNode.style.display=\'none\';"></td>' +
    '<td><h1 id="inspector_header_for_' + this.book.getName()  + '">' +
    'Canvas Inspector</h1></td>' +
    '<td class="inspector_corner"></td></tr></table>' +

    '<div id="inspector_tabs_for_' + this.book.getName() + 
    '" class="inspector_tabs"></div>' +
    '<div id="inspector_content_for_' + this.book.getName() + 
    '"class="inspector_content"></div>' +

    '<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr>' +
    '<td class="inspector_status">'+ Canvas2D.version +'</td>' +
    '<td id="inspector_resize_for_' + this.book.getName() + '"' +
    'class="inspector_resize"></td>' +
    '</tr></table>';

    document.body.appendChild(this.inspector);
  },

  setupSheets: function setupSheets() {
    this.tabs    = this.getElement( "tabs"    ) ;
    this.content = this.getElement( "content" );

    this.sheetPositions.iterate( function( sheet ) {
      var tab = document.createElement("A");
      tab.id = "inspector_tab_" + sheet.getLabel() + 
               "_for_" + this.book.getName();
      tab.href = "javascript:";
      tab.className ="inspector_tab";
      tab.onclick = function(tabName) { 
        return function() { this.gotoTab(tabName); }.scope(this) 
      }.scope(this)(sheet.getLabel());
      tab.appendChild(document.createTextNode(sheet.getLabel()));
      this.tabs.appendChild(tab);

      this.content.appendChild(sheet.getElement(this.book.getName()));
    }.scope(this) );
  },

  gotoTab: function gotoTab(tab) {
    if( this.currentTab   ) { 
      this.currentTab.className   = "inspector_tab";   
    }
    if( this.currentSheet ) { 
      this.currentSheet.className = "inspector_tab_content"; 
    }

    this.currentTab   = this.getElement( "tab_" + tab );
    this.currentSheet = 
      document.getElementById( tab + "_for_" + this.book.getName() );

    if( this.currentTab   ) { 
      this.currentTab.className = 
      "inspector_tab_selected"; 
    }
    if( this.currentSheet ) { 
      this.currentSheet.className =  "inspector_tab_content_selected";
    }
  },

  wireResizeAndDragHandling: function wireResizeAndDragHandling() {
    ProtoJS.Event.observe( this.getElement("resize"), 'mousedown', 
    function(event) {
      this.resizing = true; 
      this.handleMouseDown(event); 
    }.scope(this) );
    ProtoJS.Event.observe( this.getElement("header"), "mousedown", 
    function(event) {
      this.handleMouseDown(event);
      this.dragging = true;
    }.scope(this) );
    ProtoJS.Event.observe( document, 'mouseup', 
                           this.handleMouseUp.scope(this) );
    ProtoJS.Event.observe( document, 'mousemove', 
                           this.handleMouseMove.scope(this) );
  },

  handleMouseDown : function handleMouseDown(event) {
    if( event.preventDefault ) { event.preventDefault(); }
    event.returnValue = false;
    this.currentPos = this.getXY(event);
  },

  handleMouseMove : function handleMouseMove(event) {
    if( this.resizing || this.dragging ) {
      var pos = this.getXY(event);
      if( this.resizing ) {
        this.resizeBy( pos.x - this.currentPos.x, pos.y - this.currentPos.y );
      } else if( this.dragging ) {
        this.moveBy( pos.x - this.currentPos.x, pos.y - this.currentPos.y );
      }
      this.currentPos = pos;
    }
  },

  handleMouseUp : function handleMouseMove(event) {
    this.resizing = false;
    this.dragging = false;    
  },

  getXY: function getXY(e) {
    var x,y;
    if( ProtoJS.Browser.IE ) {
      x = event.clientX + document.body.scrollLeft;
      y = event.clientY + document.body.scrollTop;
    } else {
      x = e.pageX;
      y = e.pageY;
    }
    return { x: x, y: y };
  },

  resizeBy: function resizeBy(dx, dy) {
    this.resizeTo( parseInt(this.inspector.style.width) + dx, 
    parseInt(this.inspector.style.height) + dy );
  },

  resizeTo: function resizeTo(w, h) {
    this.inspector.style.width  = ( w >= 300 ? w : 300 ) + "px";
    this.inspector.style.height = ( h >= 150 ? h : 150 ) + "px";

    var widthDiff = ProtoJS.Browser.IE ? 0 : 10;

    this.content.style.width  = 
      ( parseInt(this.inspector.style.width) - widthDiff ) + "px";
    this.content.style.height = 
      ( parseInt(this.inspector.style.height) - 73 ) + "px";

    // FIXME
    if( ProtoJS.Browser.IE ) {
      this.console.style.height = this.content.style.height;
    }

    this.fireEvent( 'changeContentSize', 
    { w: parseInt(this.content.style.width),
      h: parseInt(this.content.style.height) } );
  },

  moveBy: function moveBy(dx, dy) {
    this.moveTo( parseInt(this.inspector.style.left) + dx, 
    parseInt(this.inspector.style.top ) + dy );
  },

  moveTo: function resizeTo(l, t) {
    this.inspector.style.left = (l >= 0 ? l : 0 ) + "px";
    this.inspector.style.top  = (t >= 0 ? t : 0 ) + "px";
  },

  getWidth: function getWidth() {
    return parseInt(this.inspector.style.width);
  },

  getHeight: function getHeight() {
    return parseInt(this.inspector.style.height);    
  },

  show: function show() {
    if( !this.shownBefore ) {
      this.resizeTo( this.book.getWidth(), this.book.getHeight() );
      this.shownBefore = true;
    }
    this.inspector.style.display = "block";
  },

  hide: function hide() {
    this.inspector.style.display = "none";
  },

  wireActivation: function wireActivation() {
    Canvas2D.Keyboard.on( "keyup", function(key) {
      if( this.book.canvas.mouseOver && key == "73" ) {
        this.show();
      }
    }.scope(this));
  },

  getName: function getName() { return "Inspector"; }
} );

Canvas2D.Inspector.Sheet = Class.extend( {

  /**
   * Sheet constructor
   * @param label label for the sheet
   * @param element the html element for the content of the sheet. Optional,
   *                if not given, a div element is created.
   * @return a Sheet
   */
  init: function init(label, element) {
    this.label   = label;
    this.element = element || document.createElement('div');
  },

  /**
   * Provides the label of the sheet.
   * @return the label
   */
  getLabel: function getLabel() {
    return this.label;
  },

  /**
   * Sets the label. 
   * @param label the label to set
   */
  setLabel: function setLabel(label) {
    this.label = label;
  },

  /**
   * Provides an html representation of the sheet and its content.
   * @param canvasName name of the Canvas for which the element is created
   * @return an html snippet
   */
  getElement: function getElement(canvasName) {
    this.element.id = this.getLabel() + "_for_" + canvasName;
    this.element.className = "inspector_tab_content";
    this.element.style.resize = "none";

    return this.element;
  }
} );

// mix in event handling
ProtoJS.mix( ProtoJS.Event.Handling, Canvas2D.Inspector.prototype );

Canvas2D.Inspector.getInstance = function getInstance(book) {
  if( book.hasCanvasElement() && ! book.hasTag("withoutInspector") ) {
    return new Canvas2D.Inspector(book);
  }
};

Canvas2D.Book.addPlugin( "Inspector", Canvas2D.Inspector );

(function() {
var head = document.getElementsByTagName("head")[0],
style = document.createElement("style"),
rules = document.createTextNode(
  '.inspector {  display: none;  position: absolute;  background-color: black;  z-index: 999; }' +
  '.inspector_close { float:left;  background: url("http://static.thesoftwarefactory.be/images/inspector/left.png") no-repeat;  height:18px;  width:18px;  cursor:pointer; }' +
  '.inspector_corner { float:right;  background: url("http://static.thesoftwarefactory.be/images/inspector/right.png") no-repeat;  height:18px;  width:12px; }' +
  '.inspector_header {  background-color: #494949;  width: 100%;  margin-bottom: 5px; }' +
  '.inspector H1 {  color: white;  background-color: #494949;  margin-top: 0px;  padding: 3px 0px 0px 0px;  width: 100%;  text-align: center;  font: 8pt Arial;  cursor: move; }' +
  '.inspector_tabs { text-align: center; height: 20px; }' +
  '.inspector_tab { display: inline-block; text-align: center; width: 55px; background-color: #333;    margin: 0px;  padding: 3px;  text-decoration: none;  color: white;  font: 10pt Arial;  border-top: 1px solid #888;  border-right: 1px solid #555; }' +
  '.inspector_tab {  display: inline-block;  text-align: center;  width: 55px;  background-color: #333;    margin: 0px;  padding: 3px;  text-decoration: none;  color: white;  font: 10pt Arial;  border-top: 1px solid #888;  border-right: 1px solid #555; }' +
  '.inspector_tab_selected {  display: inline-block;  text-align: center;  width: 55px;  margin: 0px;  padding: 3px;  text-decoration: none;  color: white;  font: 10pt Arial;  border-top: 1px solid #888;  border-right: 1px solid #555;  background-color: #888; }' +
  '.inspector_tab:hover {  background-color: #888; }' +
  '.inspector_content {  padding: 5px; }' +
  '.inspector_tab_content { display: none; }' +
  '.inspector_tab_content_selected { display: block; }' +
  '.inspector_content TEXTAREA {  width: 100%;  height: 100%; }' +
  '.inspector_content DIV {  width: 100%;  height: 100%;  background-color: white;  overflow: auto;  font: 9pt Arial;  }' +
  '.inspector_resize { cursor: se-resize; background: url("http://static.thesoftwarefactory.be/images/resize.png") no-repeat; height: 15px; width: 15px; padding-right: 3px; }' +
  '.inspector_status {  padding-left: 5px;  font: 8pt Arial;  color: #777; }' +
  '.inspector_content DIV.toolbar { height:18px; background-color: #CCC; border-bottom: 1px solid #777; overflow: hidden; }' +
  '.inspector_properties { width: 95%; }' +
  '.inspector .inspector_properties TD { width: 65%; vertical-align:top; }' +
  '.inspector TH { font-size:8pt;  text-align:right;  vertical-align:top;  padding-top:5px;  width: 1%; }' +
  '.inspector TD INPUT { font: 8pt Arial; width: 100%; }' +
  '.inspector TD TEXTAREA { font: 8pt Arial; width: 100%;  height: 50px; }' +
  '.inspector TD A {  font: 8pt Arial;  width: 100%;  height: 50px; }' +
  'SPAN.invalid {  color: #faa;  font-size:8pt; }'
);

style.type = "text/css";
if( style.styleSheet ) { 
  style.styleSheet.cssText = rules.nodeValue;
} else {
  style.appendChild(rules);
  if( head ) { head.appendChild(style); }
}
})();
