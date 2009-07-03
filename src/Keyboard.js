Canvas2D.KeyboardDriver = Class.extend( {
    init: function initialize() {
	this.currentKeysDown = [];
	ProtoJS.Event.observe(document, 'keydown', 
			      this.handleKeyDownEvent.scope(this));
	ProtoJS.Event.observe(document, 'keyup', 
			      this.handleKeyUpEvent.scope(this));
    },

    handleKeyDownEvent: function( event ) {
	var key = (event || window.event).keyCode;
	this.currentKeysDown.push(key);
	this.fireEvent( "keydown", key );
    },

    handleKeyUpEvent: function handleKeyUpEvent( event ) {
	var key = (event || window.event).keyCode;
	this.currentKeysDown = this.currentKeysDown.remove(key);
	this.fireEvent( "keyup", key );
    },

    getCurrentKeysDown: function getCurrentKeysDown() {
	return this.currentKeysDown;
    },

    keyDown: function keyDown(key) {
	return this.currentKeysDown.contains(key);
    }
} );

ProtoJS.mix( Canvas2D.Factory.extensions.all.EventHandling,
	     Canvas2D.KeyboardDriver.prototype );

Canvas2D.Keyboard = new Canvas2D.KeyboardDriver();
