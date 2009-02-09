Canvas2D.Connector = Class.create( Canvas2D.Shape, {
    defaults: { color: "black", 
		lineStyle: "solid",
		width: 2, 
		begin: null, 
		end: null },

    delayRender: function() {
	return true;
    },
    
    initialize: function($super, from, to, props) {
	$super(props || {});
	this.from = from;
	this.to   = to;
    },

    draw: function() {
	this.canvas.strokeStyle = this.props.color || this.defaults.color;
	this.canvas.lineWidth   = this.props.width || this.defaults.width;
	this.canvas.lineStyle   = this.props.lineStyle 
	    || this.defaults.lineSstyle; 
	
	this.canvas.beginPath();
	switch( this.props.style ) {
	  case "vertical":    this._vertical();    break;
	  case "horizontal":  this._horizontal();  break;
	  case "direct":      default: this._direct();
	}
	this.canvas.stroke();
    },

    _direct: function() {
	var from, to;
	// TODO add connector
	// TODO intersection with border
	from = this.from.getCenter();
	to   = this.to.getCenter();
	this.canvas.moveTo(from.left, from.top);
	this.canvas.lineTo(to.left,   to.top);
    },

    draw_connector: function(shape, port, left, top) {
	var left = left || shape.getPort(port).left;
	var top  = top  || shape.getPort(port).top;
	
	this.canvas.moveTo(left, top);

	var connector = null;
	if( shape == this.from && this.props.begin ) {
	    connector = this.props.begin[port];
	}
	if( shape == this.to && this.props.end ) {
	    connector = this.props.end[port];
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
	if( this.from.getBox().top < this.to.getBox().top ) {
	    top    = this.from;  bottom = this.to;
	} else {
	    top    = this.to;    bottom = this.from;
	}

	if( bottom.getBox().top - top.getBox().bottom >= this.minTreeDist ) {
	    this._vertical_tree( top, bottom );
	} else if( bottom.getCenter().top - top.getBox().bottom 
		   >= this.minCornerDist) {  
	    this._vertical_corner( top, bottom );
	} else {
	    this._vertical_line(this.from, this.to);
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
	if( this.from.getBox().left < this.to.getBox().left ) {
	    left  = this.from; right = this.to;
	} else {
	    left  = this.to;   right = this.from;
	}

	if( right.getBox().left - left.getBox().right >= this.minTreeDist ) {
	    this._horizontal_tree( left, right );
	} else if( right.getCenter().left - left.getBox().right 
		   >= this.minCornerDist) {  
	    this._horizontal_corner( left, right );
	} else {
	    this._horizontal_line(this.from, this.to);
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

    hitArea: function(left, top, width, height) {
	// connectors aren't selectable ("en mass")
	return false;
    },

    toADL: function(prefix) {
	var s = this.positionToString(prefix);
	s += prefix + "Connector " + this.props.name;
	s += "+" + this.from.props.name + "-" + this.to.props.name;
	s += " +" + this.props.style + ";";
	return s;
    }

} );

Canvas2D.Connector.getNames = function() {
    return [ "connector", "link" ];
};

Canvas2D.Connector.from = function(construct, sheet) {
    var from, to, style;
    var fromModifier = construct.modifiers.get( "from"  );
    if( fromModifier ) {
	from = fromModifier.value.value;
    }
    var toModifier = construct.modifiers.get( "to" );
    if( toModifier ) {
	to = toModifier.value.value;
    }
    var styleModifier = construct.modifiers.get( "style" );
    if( styleModifier ) {
	style = styleModifier.value.value;
    }
    construct.modifiers.each(function(pair) {
	if( pair.value.value == null ) {
	    if( pair.key.include("-") ) {
		var parts = pair.key.split( "-" );
		from = parts[0];
		to   = parts[1];
	    } else {
		style = pair.key;
	    }
	}
    });
    var conn = new Canvas2D.Connector( sheet.shapesMap[from], 
		 		       sheet.shapesMap[to],
				       { name: construct.name, style: style } );
    sheet.put(conn);
    return conn;
};

Canvas2D.ADLVisitor.registerConstruct(Canvas2D.Connector);
