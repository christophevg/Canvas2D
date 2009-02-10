Canvas2D.Connector = Class.create( Canvas2D.Shape, {
    allProperties: function($super) {
	var props = $super();
	props.push( "routing"   );
	props.push( "lineColor" );
	props.push( "lineStyle" );
	props.push( "lineWidth" );
	props.push( "from"      );
	props.push( "to"        );
	props.push( "begin"     );
	props.push( "end"       );
	return props;
    },

    defaults: { lineColor : "black", 
		lineStyle : "solid",
		lineWidth : 2, 
		begin     : null, 
		end       : null },

    getType : function() { return "connector"; },

    getRouting: function() { return this.routing; },

    getLineColor : function() { return this.lineColor; },
    getLineStyle : function() { return this.lineStyle; },
    getLineWidth : function() { return this.lineWidth; },

    getFrom  : function() { return this.from; },
    getTo    : function() { return this.to;   },

    getBegin  : function() { return this.begin; },
    getEnd    : function() { return this.end;   },

    delayRender: function() {
	return true;
    },
    
    draw: function() {
	this.canvas.strokeStyle = 
	    this.getLineColor() || this.defaults.lineColor;
	this.canvas.lineWidth   = 
	    this.getLineWidth() || this.defaults.lineWidth;
	this.canvas.lineStyle   =
	    this.getLineStyle() || this.defaults.lineStyle; 
	
	this.canvas.beginPath();
	switch( this.getRouting() ) {
	  case "vertical":    this._vertical();    break;
	  case "horizontal":  this._horizontal();  break;
	  case "direct":      default: this._direct();
	}
	this.canvas.stroke();
    },

    _direct: function() {
	var from, to;
	// TODO add connectors implementation
	// TODO start at intersection with border of box
	from = this.getFrom().getCenter();
	to   = this.getTo().getCenter();
	this.canvas.moveTo(from.left, from.top);
	this.canvas.lineTo(to.left,   to.top);
    },

    draw_connector: function(shape, port, left, top) {
	var left = left || shape.getPort(port).left;
	var top  = top  || shape.getPort(port).top;
	
	this.canvas.moveTo(left, top);

	var connector = null;
	if( shape == this.getFrom() && this.getBegin() ) {
	    connector = this.getBegin()[port];
	}
	if( shape == this.getTo() && this.getEnd() ) {
	    connector = this.getEnd()[port];
	}

	if( connector ) {
	    var oldStyle = this.canvas.lineStyle;
	    this.canvas.lineStyle = "solid";
	    this.canvas.stroke();
	    this.canvas.beginPath();
	    this.canvas.moveTo(left, top);
	    var canvas = this.canvas;
	    connector.lines.each(function(d){
		if(d == "fill") {
		    canvas.fillStyle = "rgba( 0, 0, 0, 1 )";
		    canvas.fill();
		} else {
		    canvas.lineTo(left + d[0], top + d[1]);
		}
	    });
	    this.canvas.stroke();
	    this.canvas.beginPath();
	    this.canvas.lineStyle = oldStyle;
	    this.canvas.moveTo(left + connector.end[0], top + connector.end[1]);
	}
    },

    minTreeDist: 30,
    minCornerDist : 15,

    initialBranchLength: function(top, bottom) {
	return ( bottom - top ) / 2;
    },

    _vertical: function() {
	var top, bottom;
	if( this.getFrom().getBox().top < this.getTo().getBox().top ) {
	    top    = this.getFrom();  bottom = this.getTo();
	} else {
	    top    = this.getTo();    bottom = this.getFrom();
	}

	if( bottom.getBox().top - top.getBox().bottom >= this.minTreeDist ) {
	    this._vertical_tree( top, bottom );
	} else if( bottom.getCenter().top - top.getBox().bottom 
		   >= this.minCornerDist) {  
	    this._vertical_corner( top, bottom );
	} else {
	    this._vertical_line(this.getFrom(), this.getTo());
	}
    },

    _vertical_tree: function( top, bottom ) {
	this.draw_connector(top, "s");

	var src = top.getPort("s");
	var trg = bottom.getPort("n");
	var dy1 = this.initialBranchLength( src.top, trg.top );

	this.canvas.lineTo(src.left, src.top + dy1);
	this.canvas.lineTo(trg.left, src.top + dy1);
	this.draw_connector( bottom, "n" );
	this.canvas.lineTo(trg.left, src.top + dy1);
    },

    _vertical_corner: function(top, bottom) {
	this.draw_connector( top, "s" );

	var src = top.getPort("s");
	var trgPort = src.left < bottom.getPort("w").left ? "w" : "e";
	var trg = bottom.getPort(trgPort);
	
	this.canvas.lineTo( src.left, trg.top );
	
	this.draw_connector( bottom, trgPort );
	this.canvas.lineTo(src.left, trg.top);
    },

    _vertical_line: function(from, to) {
	var fromPort, toPort;
	if( from.getBox().right < to.getBox().left ) {
	    fromPort = "e"; toPort = "w";
	} else {
	    fromPort = "w"; toPort = "e";
	}

	var y = from.getPort(fromPort).top -
	    ( ( from.getPort(fromPort).top - to.getPort(toPort).top ) / 2 );
	var dx = (to.getPort(toPort).left - from.getPort(fromPort).left ) / 2;

	this.draw_connector( from, fromPort, null, y );
	this.canvas.lineTo( from.getPort(fromPort).left+dx, y);
	this.draw_connector( to,   toPort,   null, y );
	this.canvas.lineTo( from.getPort(fromPort).left+dx, y);
    },

    _horizontal: function() {
	var left, right;
	if( this.getFrom().getBox().left < this.getTo().getBox().left ) {
	    left  = this.getFrom(); right = this.getTo();
	} else {
	    left  = this.getTo();   right = this.getFrom();
	}

	if( right.getBox().left - left.getBox().right >= this.minTreeDist ) {
	    this._horizontal_tree( left, right );
	} else if( right.getCenter().left - left.getBox().right 
		   >= this.minCornerDist) {  
	    this._horizontal_corner( left, right );
	} else {
	    this._horizontal_line(this.getFrom(), this.getTo());
	}
    },

    _horizontal_tree: function( left, right ) {
	this.draw_connector(left, "e");

	var src = left.getPort("e");
	var trg = right.getPort("w");
	var dx1 = this.initialBranchLength( src.left, trg.left );

	this.canvas.lineTo(src.left + dx1, src.top);
	this.canvas.lineTo(src.left + dx1, trg.top);

	this.draw_connector( right, "w" );
	this.canvas.lineTo(src.left + dx1, trg.top);
    },

    _horizontal_corner: function(left, right) {
	this.draw_connector( right, "w" );

	var src = right.getPort("w");
	var trgPort = src.top < left.getPort("n").top ? "n" : "s";
	var trg = left.getPort(trgPort);
	
	this.canvas.lineTo( trg.left, src.top );
	
	this.draw_connector( left, trgPort );
	this.canvas.lineTo(trg.left, src.top);
    },

    _horizontal_line: function(from, to) {
	var fromPort, toPort;
	if( from.getBox().bottom < to.getBox().top ) {
	    fromPort = "s"; toPort = "n";
	} else {
	    fromPort = "n"; toPort = "s";
	}

	var x = from.getPort(fromPort).left -
	    ( ( from.getPort(fromPort).left - to.getPort(toPort).left ) / 2 );
	var dy = (to.getPort(toPort).top - from.getPort(fromPort).top ) / 2;

	this.draw_connector( from, fromPort, x );
	this.canvas.lineTo( x, from.getPort(fromPort).top+dy);

	this.draw_connector( to,   toPort,   x );
	this.canvas.lineTo( x, from.getPort(fromPort).top+dy);
    },

    hit: function(x,y) {
	// connectors aren't selectable (for now ;-))
	return false;
    },

    asConstruct: function($super) {
	var construct = $super();
	if( this.getFrom() && this.getTo() ) {
	    construct.modifiers[this.getFrom() + "-" + this.getTo()] = null;
	}
	if( this.getLineColor() ) {
	    construct.modifiers.lineColor = this.getLineColor();
	}
	if( this.getLineStyle() ) {
	    construct.modifiers.lineStyle = this.getLineStyle();
	}
	if( this.getLineWidth() ) {
	    construct.modifiers.lineWidth = this.getLineWidth();
	}
	if( this.getBegin() ) {
	    construct.modifiers.begin = this.getBegin();
	}
	if( this.getEnd() ) {
	    construct.modifiers.end = this.getEnd();
	}
	return construct;
    }

} );

Canvas2D.Connector.getNames = function() {
    return [ "connector", "link" ];
};

Canvas2D.Connector.from = function(construct, sheet) {
    var from, to, routing;
    var fromModifier = construct.modifiers.get( "from"  );
    if( fromModifier ) {
	from = fromModifier.value.value;
    }
    var toModifier = construct.modifiers.get( "to" );
    if( toModifier ) {
	to = toModifier.value.value;
    }
    var routingModifier = construct.modifiers.get( "routing" );
    if( routingModifier ) {
	routing = routingModifier.value.value;
    }
    construct.modifiers.each(function(pair) {
	if( pair.value.value == null ) {
	    if( pair.key.include("-") ) {
		var parts = pair.key.split( "-" );
		from = parts[0];
		to   = parts[1];
	    } else {
		routing = pair.key;
	    }
	}
    });
    var conn = new Canvas2D.Connector( 
	{ 
	    from : sheet.shapesMap[from], 
	    to: sheet.shapesMap[to],
	    name: construct.name, 
	    routing: routing 
	} );
    sheet.put(conn);
    return conn;
};

Canvas2D.ADLVisitor.registerConstruct(Canvas2D.Connector);
