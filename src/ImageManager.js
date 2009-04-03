Canvas2D.ImageManager = {};

Canvas2D.ImageManager.work = 0;

Canvas2D.ImageManager.load = function(src, onload) {
    var image = new Image();
    Canvas2D.ImageManager.work++;
    image.onload = function() {
	Canvas2D.ImageManager.work--;
	onload();
    }
    image.src = src;
    return image;
};

Canvas2D.ImageManager.isReady = function() {
    return Canvas2D.ImageManager.work == 0;
};