Canvas2D.KeyboardDriver = Class.create( {
    initialize: function initialize() {
	this.currentKeysDown = [];
	Event.observe(document, 'keydown', 
		      this.handleKeyDownEvent.bindAsEventListener(this));
	Event.observe(document, 'keyup', 
		      this.handleKeyUpEvent.bindAsEventListener(this));
    },

    handleKeyDownEvent: function( event ) {
	var key = (event || window.event).keyCode;
	this.currentKeysDown.push(key);
	this.fireEvent( "keydown", key );
    },

    handleKeyUpEvent: function handleKeyUpEvent( event ) {
	var key = (event || window.event).keyCode;
	this.currentKeysDown = this.currentKeysDown.without(key);
	this.fireEvent( "keyup", key );
    },

    getCurrentKeysDown: function getCurrentKeysDown() {
	return this.currentKeysDown;
    },

    keyDown: function keyDown(key) {
	return this.currentKeysDown.contains(key);
    }
} );

Canvas2D.KeyboardDriver =
    Class.create( Canvas2D.KeyboardDriver,
		  Canvas2D.Factory.extensions.all.EventHandling );

Canvas2D.Keyboard = new Canvas2D.KeyboardDriver();
