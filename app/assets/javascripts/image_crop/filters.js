/*
  From:
  http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
*/

Filters = {};

Filters.getPixels = function(img) {
  var c = this.getCanvas(img.width, img.height);
  var ctx = c.getContext('2d');
  ctx.drawImage(img);
  return ctx.getImageData(0,0,c.width,c.height);
};

Filters.getCanvas = function(w,h) {
  var c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

Filters.filterImage = function(filter, image, var_args) {
  var args = [this.getPixels(image)];
  for (var i=2; i<arguments.length; i++) {
    args.push(arguments[i]);
  }
  return filter.apply(null, args);
};

Filters.grayscale = function(pixels, args) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
    // CIE luminance for the RGB
    // The human eye is bad at seeing red and blue, so we de-emphasize them.
    var v = 0.2126*r + 0.7152*g + 0.0722*b;
    d[i] = d[i+1] = d[i+2] = v
  }
  return pixels;
};

/*
  Fakes a histrogram equalization
*/
Filters.autoLevels = function(pixels, args) {
  var d = pixels.data;

  var
    intens = [],
    levels = [],
    j = 0;
  for (var i=0;i<256;i++) {
    levels[i]=0;
  }
  for (var i=0; i<d.length; i+=4) {
    intens[j] = (d[i]+d[i+1]+d[i+2])/3;
    levels[Math.round(intens[j])]++;
    j++;
  }
  var cdf=[];
  cdf[0]=levels[0];
  for (var i=1;i<256;i++){
    cdf[i]=cdf[i-1]+levels[i];
  }
  var x;
  var all=pixels.data.length/4.0;
  for (var j=0;j<intens.length;j++){
    d[j*4]=((cdf[d[j*4]]-cdf[0]) /(all-cdf[0]))*255;
    d[j*4+1]=((cdf[d[j*4+1]]-cdf[0]) /(all-cdf[0]))*255;
    d[j*4+2]=((cdf[d[j*4+2]]-cdf[0]) /(all-cdf[0]))*255;
    d[j*4+3]=255;
  }
  return pixels;
};

Filters.tmpCanvas = document.createElement('canvas');

Filters.tmpCtx = Filters.tmpCanvas.getContext('2d');

Filters.createImageData = function(w,h) {
  return this.tmpCtx.createImageData(w,h);
};

Filters.convolute = function(pixels, weights, opaque) {
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side/2);
  var src = pixels.data;
  var sw = pixels.width;
  var sh = pixels.height;
  // pad output by the convolution matrix
  var w = sw;
  var h = sh;
  var output = Filters.createImageData(w, h);
  var dst = output.data;
  // go through the destination image pixels
  var alphaFac = opaque ? 1 : 0;
  for (var y=0; y<h; y++) {
    for (var x=0; x<w; x++) {
      var sy = y;
      var sx = x;
      var dstOff = (y*w+x)*4;
      // calculate the weighed sum of the source image pixels that
      // fall under the convolution matrix
      var r=0, g=0, b=0, a=0;
      for (var cy=0; cy<side; cy++) {
        for (var cx=0; cx<side; cx++) {
          var scy = sy + cy - halfSide;
          var scx = sx + cx - halfSide;
          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            var srcOff = (scy*sw+scx)*4;
            var wt = weights[cy*side+cx];
            r += src[srcOff] * wt;
            g += src[srcOff+1] * wt;
            b += src[srcOff+2] * wt;
            a += src[srcOff+3] * wt;
          }
        }
      }
      dst[dstOff] = r;
      dst[dstOff+1] = g;
      dst[dstOff+2] = b;
      dst[dstOff+3] = a + alphaFac*(255-a);
    }
  }
  return output;
};
