if( !document.createElement('canvas').getContext &&
    !G_vmlCanvasManager.initElement ) {
    alert( "You browser doesn't support the Canvas element. " +
	   "If you're using IE, ExplorerCanvas is required." );
} else if( typeof CanvasTextFunctions == "undefined" ) {
    alert( "Canvas2D requires the CanvasText implementation." );
}

/*
if( typeof Canvas2D != "undefined" ) {
    alert( "WARNING: Canvas2D is already defined and will be redefined!!!" );
}
*/

