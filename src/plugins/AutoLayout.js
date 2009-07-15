Canvas2D.Book.plugins.AutoLayout = Class.extend( {
    init: function(book) {
	this.book = book;
	this.active = false;
    },

    // this method is exposed and therefore called on a book
    autoLayout: function autoLayout(strategy) {
	this.strategy = strategy;
	this.strategy.start();
	this.active = true;
	this.book.rePublish();
    },

    beforeRender: function beforeRender(book) {
	if( !this.active ) { return; }

	var shapes = [];
	var shapeMap = $H();
	var c = 0;
	book.getCurrentSheet().positions.iterate( function( pos ) {
	    if( !(pos.shape instanceof Canvas2D.Connector) ) {
		shapes.push( { position: pos,
			       x: pos.left + pos.shape.getWidth()/2, 
			       y: pos.top + pos.shape.getHeight()/2, 
			       s: pos.shape.getWidth() > pos.shape.getHeight() ?
			       pos.shape.getWidth() : pos.shape.getHeight(),
			       f1: 0, f2: 0, 
			       c:[] } );
		shapeMap.set(pos.shape.getName(), parseInt(c++));
	    }
	} );

	// collect connectors
	book.getCurrentSheet().positions.iterate( function( pos ) {
	    if( pos.shape instanceof Canvas2D.Connector ) {
		var from = 
		    shapeMap.get(pos.shape.getFrom(book.getCurrentSheet()).getName());
		var to   = 
		    shapeMap.get(pos.shape.getTo(book.getCurrentSheet()).getName());
		shapes[from].c.push(to);
		shapes[to].c.push(from);
	    }
	} );

	
	// apply layout strategy
	shapes = this.strategy.layout(shapes);

	if( shapes ) {
	    shapes.iterate( function( shape ) {
		shape.position.left = 
		    shape.x - shape.position.shape.getWidth() / 2;
		shape.position.top  = 
		    shape.y - shape.position.shape.getHeight() / 2;
	    } );
	} else {
	    this.active = false;
	}
    },

    afterPublish: function afterPublish(book) {
	if( this.active ) { book.rePublish(); }
    }
} );
    
Canvas2D.Book.plugins.AutoLayout.exposes = [ "autoLayout" ];
    
var ForceLayoutStrategy = Class.extend( {
    init: function initialize(config) {
	this.max_repulsive_force_distance = 
	    config["max_repulsive_force_distance"] || 50;
	this.k = config["k"] || 20;
	this.c = config["c"] || 0.05;
	this.max_movement = config["max_movement"] || 10;
	this.max_iterations = config["max_iterations"] || 1000;
	this.render = config["render"] || function() {};
	this.canContinue = config["canContinue"] || 
	    function() { return false; };
    },
    
    getIterations: function getIterations() {
	return this.iteration;
    },
    
    start: function start() {
	this.iteration = 0;
    },
    
    layout: function layout(elements) {
	this.elements = elements;
	if( this.canContinue() ) {
	    if( this.iteration <= this.max_iterations ) { 
		this._layout();
		return this.elements;
	    }
	}
	return null;
    },
    
    _layout: function layout() {
	this.iteration++;
	if( this.canContinue() ) {
	    if( this.iteration <= this.max_iterations ) { 
		this._layout_iteration();
	    } else {
		console.log( "max iterations " + 
			     "(" + this.max_iterations + ") reached.");
	    }
	}
    },
    
    _layout_iteration: function _layout_iteration() {
	// reset forces
	for(var s=0; s<this.elements.length; s++) {
	    this.elements[s].f1 = 0;
	    this.elements[s].f2 = 0;
	}
	// repulse everybody (except self)
	for(var s=0; s<this.elements.length; s++) {
	    for(var o=0; o<this.elements.length; o++) {
		if( s !== o ) {
		    this._layout_repulsive(s, o);
		}
	    }
	}
	// attract if connected or self
	for(var s=0; s<this.elements.length; s++) {
	    for(var o=0; o<this.elements.length; o++) {
		if( s !== o && this.elements[o].c.indexOf(s) > -1 ) {
		    this._layout_attractive(s, o);
		}
	    }
	}
	
	// apply forces
	for(var s=0; s<this.elements.length; s++) {
	    var dx = this.c * this.elements[s].f1;
	    var dy = this.c * this.elements[s].f2;
	    var max = this.max_movement;
	    if( dx > max )      { dx = max; }
	    if( dx < max * -1 ) { dx = max * -1; }
	    if( dy > max )      { dy = max; }
	    if( dy < max * -1 ) { dy = max * -1; }
	    this.elements[s].x += dx;
	    this.elements[s].y += dy;
	}
    },
    
    _layout_repulsive: function _layout_repulsive(s, o) {
	var dx = this.elements[o].x - this.elements[s].x;
	var dy = this.elements[o].y - this.elements[s].y;
	
	var d2 = dx * dx + dy * dy;
	if( d2 < 0.01 ) {
	    dx = Math.random() + 0.1;
	    dy = Math.random() + 0.1;
	    d2 = dx * dx + dy * dy;
	}
	var d = Math.sqrt(d2);
	if( d < this.max_repulsive_force_distance) {
	    var repulsive_force = this.k * this.k / d;
	    
	    this.elements[o].f1 += repulsive_force * dx / d;
	    this.elements[o].f2 += repulsive_force * dy / d;
	    
	    this.elements[s].f1 -= repulsive_force * dx / d;
	    this.elements[s].f2 -= repulsive_force * dy / d;
	}
    },
    
    _layout_attractive: function _layout_attractive(s, o) {
	var dx = this.elements[o].x - this.elements[s].x;
	var dy = this.elements[o].y - this.elements[s].y;
	
	var d2 = dx * dx + dy * dy;
	if( d2 < 0.01 ) {
	    dx = Math.random() + 0.1;
	    dy = Math.random() + 0.1;
	    d2 = dx * dx + dy * dy;
	}
	var d = Math.sqrt(d2);
	if( d > this.max_repulsive_force_distance) {
	    d = this.max_repulsive_force_distance;
	    d2 = d * d;
	}
	var attractive_force = ( d2 - this.k * this.k ) / this.k;
	var weight = this.elements[s].s;
	if( weight < 1 ) { weight = 1; }
	attractive_force *= Math.log(weight) * 0.5 + 1;
	
	this.elements[o].f1 -= attractive_force * dx / d;
	this.elements[o].f2 -= attractive_force * dy / d;
	
	this.elements[s].f1 += attractive_force * dx / d;
	this.elements[s].f2 += attractive_force * dy / d;
    }
});
