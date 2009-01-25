if( typeof Prototype == "undefined" ) {
    alert( "Canvas2D requires the Prototype JS library." );
} else if( !window.CanvasRenderingContext2D ) {
    alert( "Could not find CanvasRenderingContext2D. " +
	   "If you're using IE, ExplorerCanvas is required." );
} else if( typeof CanvasTextFunctions == "undefined" ) {
    alert( "Canvas2D requires the CanvasText implementation." );
}

if( typeof Canvas2D != "undefined" ) {
    alert( "WARNING: Canvas2D is already defined and will be redefined!!!" );
}
