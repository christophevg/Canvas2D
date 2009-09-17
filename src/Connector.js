Canvas2D.Connector = Canvas2D.Shape.extend( {
    preprocess: function preprocess(props) {
	props = this._super(props);
	if( props.from == props.to ) { props.routing = "recursive"; }
	return props;
    },

    getFrom  : function(sheet) { 
	return sheet ? sheet.getPosition(this.from) : this.from; 
    },

    getTo    : function(sheet) { 
	return sheet ? sheet.getPosition(this.to)   : this.to;   
    },

    delayRender: function() { return true; },
    
    draw: function(sheet, left, top) {
	sheet.useCrispLines = this.getUseCrispLines();
	sheet.strokeStyle   = this.getLineColor();
	sheet.lineWidth     = this.getLineWidth();
	sheet.lineStyle     = this.getLineStyle();
	
	sheet.beginPath();
	switch( this.getRouting() ) {
	case "recursive":           this._recursive (sheet); break;
	case "vertical":            this._vertical  (sheet); break;
	case "horizontal":          this._horizontal(sheet); break;
	case "direct":     default: this._direct    (sheet);
	}
	sheet.closePath();
	sheet.stroke();
    },

    _recursive: function _recursive(sheet) {
	shape = this.getFrom(sheet);
	start = shape.getPort("e");
	end   = shape.getPort("n");
	dw    = parseInt(shape.getWidth() / 4);
	dh    = parseInt(shape.getHeight() / 4);
	d     = 30;

	this.draw_start_connector(sheet, shape, "e", start.left, start.top - dh);
	sheet.lineTo(start.left + d, start.top - dh );
	sheet.lineTo(start.left + d, end.top - d );
	sheet.lineTo(end.left + dw, end.top - d );
	this.draw_end_connector(sheet, shape, "n", end.left + dw, end.top );
	sheet.lineTo(end.left + dw, end.top - d);
    },

    _direct: function(sheet) {
	var from, to;
	// TODO add connectors implementation
	// TODO start at intersection with border of box
	from = this.getFrom(sheet).getCenter();
	to   = this.getTo(sheet).getCenter();
	sheet.moveTo(from.left, from.top);
	sheet.lineTo(to.left,   to.top);
    },

    draw_start_connector: function start_connector(sheet, shape, port, left, top) {
	left = left || shape.getPort(port).left;
	top  = top  || shape.getPort(port).top;
	
	var connector = null;
	if( this.getBegin() ) { connector = this.getBegin()[port]; }
	
	this._draw_connector(sheet, connector, left, top );
    },

    draw_end_connector: function start_connector(sheet, shape, port, left, top) {
	left = left || shape.getPort(port).left;
	top  = top  || shape.getPort(port).top;
	
	var connector = null;
	if( this.getEnd() ) { connector = this.getEnd()[port]; }

	this._draw_connector(sheet, connector, left, top );
    },

    draw_connector: function(sheet, shape, port, left, top ) {
	left = left || shape.getPort(port).left;
	top  = top  || shape.getPort(port).top;
	
	var connector = null;
	if( shape == this.getFrom(sheet) && this.getBegin() ) {
            connector = this.getBegin()[port];
	}
	if( shape == this.getTo(sheet) && this.getEnd() ) {
            connector = this.getEnd()[port];
	}	

	this._draw_connector(sheet, connector, left, top );
    },
    
    _draw_connector: function(sheet, connector, left, top) {
	sheet.moveTo(left, top);
	if( connector ) {
	    var oldStyle = sheet.lineStyle;
	    sheet.lineStyle = "solid";
	    sheet.stroke();
	    sheet.beginPath();
	    sheet.moveTo(left, top);
	    connector.lines.iterate(function(d){
		if(d == "fill") {
		    sheet.fillStyle = "rgba( 0, 0, 0, 1 )";
		    sheet.fill();
		} else {
		    sheet.lineTo(left + d[0], top + d[1]);
		}
	    });
	    sheet.stroke();
	    sheet.beginPath();
	    sheet.lineStyle = oldStyle;
	    sheet.moveTo(left + connector.end[0], top + connector.end[1]);
	}
    },

    initialBranchLength: function(top, bottom) {
	return ( bottom - top ) / 2;
    },

    _vertical: function(sheet) {
	var top, bottom;
	if( this.getFrom(sheet).getBox().top < 
	    this.getTo(sheet).getBox().top ) 
	{
	    top    = this.getFrom(sheet);  
	    bottom = this.getTo(sheet);
	} else {
	    top    = this.getTo(sheet);    
	    bottom = this.getFrom(sheet);
	}

	if( bottom.getBox().top - top.getBox().bottom >= 
	    Canvas2D.Connector.Defaults.minTreeDist )
	{
	    this._vertical_tree( sheet, top, bottom );
	} else if( bottom.getCenter().top - top.getBox().bottom 
		   >= Canvas2D.Connector.Defaults.minCornerDist)
	{  
	    this._vertical_corner( sheet, top, bottom );
	} else {
	    this._vertical_line( sheet, this.getFrom(sheet), this.getTo(sheet));
	}
    },

    _vertical_tree: function( sheet, top, bottom ) {
	this.draw_connector(sheet, top, "s");

	var src = top.getPort("s");
	var trg = bottom.getPort("n");
	var dy1 = this.initialBranchLength( src.top, trg.top );

	sheet.lineTo(src.left, src.top + dy1);
	sheet.lineTo(trg.left, src.top + dy1);
	this.draw_connector( sheet, bottom, "n" );
	sheet.lineTo(trg.left, src.top + dy1);
    },

    _vertical_corner: function(sheet, top, bottom) {
	this.draw_connector( sheet, top, "s" );

	var src = top.getPort("s");
	var trgPort = src.left < bottom.getPort("w").left ? "w" : "e";
	var trg = bottom.getPort(trgPort);
	
	sheet.lineTo( src.left, trg.top );
	
	this.draw_connector( sheet, bottom, trgPort );
	sheet.lineTo(src.left, trg.top);
    },

    _vertical_line: function(sheet, from, to) {
	var fromPort, toPort;
	if( from.getBox().right < to.getBox().left ) {
	    fromPort = "e"; toPort = "w";
	} else {
	    fromPort = "w"; toPort = "e";
	}

	var y = from.getPort(fromPort).top -
	    ( ( from.getPort(fromPort).top - to.getPort(toPort).top ) / 2 );
	var dx = (to.getPort(toPort).left - from.getPort(fromPort).left ) / 2;

	this.draw_connector( sheet, from, fromPort, null, y );
	sheet.lineTo( from.getPort(fromPort).left+dx, y);
	this.draw_connector( sheet, to,   toPort,   null, y );
	sheet.lineTo( from.getPort(fromPort).left+dx, y);
    },

    _horizontal: function(sheet) {
	var left, right;
	if( this.getFrom(sheet).getBox().left <
	    this.getTo(sheet).getBox().left )
	{
	    left  = this.getFrom(sheet); right = this.getTo(sheet);
	} else {
	    left  = this.getTo(sheet);   right = this.getFrom(sheet);
	}

	if( right.getBox().left - left.getBox().right >= 
	    Canvas2D.Connector.Defaults.minTreeDist )
	{
	    this._horizontal_tree( sheet, left, right );
	} else if( right.getCenter().left - left.getBox().right 
		   >= Canvas2D.Connector.Defaults.minCornerDist)
	{  
	    this._horizontal_corner( sheet, left, right );
	} else {
	    this._horizontal_line(sheet, this.getFrom(sheet), this.getTo(sheet));
	}
    },

    _horizontal_tree: function( sheet, left, right ) {
	this.draw_connector(sheet, left, "e");

	var src = left.getPort("e");
	var trg = right.getPort("w");
	var dx1 = this.initialBranchLength( src.left, trg.left );

	sheet.lineTo(src.left + dx1, src.top);
	sheet.lineTo(src.left + dx1, trg.top);

	this.draw_connector( sheet, right, "w" );
	sheet.lineTo(src.left + dx1, trg.top);
    },

    _horizontal_corner: function(sheet, left, right) {
	this.draw_connector( sheet, right, "w" );

	var src = right.getPort("w");
	var trgPort = src.top < left.getPort("n").top ? "n" : "s";
	var trg = left.getPort(trgPort);
	
	sheet.lineTo( trg.left, src.top );
	
	this.draw_connector( sheet, left, trgPort );
	sheet.lineTo(trg.left, src.top);
    },

    _horizontal_line: function(sheet, from, to) {
	var fromPort, toPort;
	if( from.getBox().bottom < to.getBox().top ) {
	    fromPort = "s"; toPort = "n";
	} else {
	    fromPort = "n"; toPort = "s";
	}

	var x = from.getPort(fromPort).left -
	    ( ( from.getPort(fromPort).left - to.getPort(toPort).left ) / 2 );
	var dy = (to.getPort(toPort).top - from.getPort(fromPort).top ) / 2;

	this.draw_connector( sheet, from, fromPort, x );
	sheet.lineTo( x, from.getPort(fromPort).top+dy);

	this.draw_connector( sheet, to,   toPort,   x );
	sheet.lineTo( x, from.getPort(fromPort).top+dy);
    },

    hit: function(x,y) {
	// connectors aren't selectable (for now ;-))
	return false;
    },

    asConstruct: function() {
	var construct = this._super();

	if( this.getFrom() && this.getTo() ) {
	    construct.modifiers[this.getFrom().getName() + "-" +
				this.getTo().getName()] = null;
	}

	construct.addModifiers( [ "lineColor", "lineStyle",
				  "lineWidth", "begin",
				  "end", "routing" ] );

	return construct;
    }

} );

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
    construct.modifiers.iterate(function(key, value) {
	if( value.value == null ) {
	    if( key.contains("-") ) {
		var parts = key.split( "-" );
		from = parts[0];
		to   = parts[1];
	    } else {
		routing = key;
	    }
	}
    });

    return new Canvas2D.Connector( { 
	from : sheet.shapesMap[from], 
	to: sheet.shapesMap[to],
	name: construct.name, 
	routing: routing 
    } );
};

Canvas2D.Connector.MANIFEST = {
    name         : "connector",
    aliasses     : [ "link" ],
    properties   : [ "routing", "lineColor", "lineStyle", "lineWidth", 
		     "from", "to", "begin", "end" ],
    libraries    : [ "Canvas2D" ]
};

Canvas2D.registerShape( Canvas2D.Connector );
