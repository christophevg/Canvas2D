if( !document.createElement('canvas').getContext &&
  !G_vmlCanvasManager.initElement ) {
  console.log( "WARNING: Your browser doesn't support the Canvas element. " +
               "If you're using IE, ExplorerCanvas is required." );
} else if( typeof CanvasTextFunctions == "undefined" ) {
  console.log( "Canvas2D requires the CanvasText implementation." );
}
