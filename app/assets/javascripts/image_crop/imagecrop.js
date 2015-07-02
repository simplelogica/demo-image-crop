var IC = {

  // Vars, items, caché
  cont: $('.crop-container'),
  img_: $('.crop-container').find('> img'),
  cma: [
    [400,300],
    [150,300],
    [250,250]
  ],
  crops: null,
  log: $('textarea#log'),
  re: $('.resulting-crops'),
  crops_form: $('.resulting-crops').find('> form#new_image_crop'),
  buffer: null,
  bu_ctx: null,

  // Initialice all
  init: function() {

    this.cont = $('.crop-container');
    this.img_ = $('.crop-container').find('> img');
    this.re = $('.resulting-crops');
    this.crops_form = $('.resulting-crops').find('> form#new_image_crop');

    // Add cropmarks
    if (this.cma.length > 0) {
      for (var j in this.cma) {
        this.addCropMark(this.cma[j][0],this.cma[j][1]);
      }
    }

    // Onload BIG image
    this.img_.on('load',function(){
      IC.pictureDim();
      IC.updateBuffer();
      IC.log.text('');
    });

  },

  // Store / update picture dimensions
  pictureDim: function() {
    this.cont.find('#main-picture-size').text('Original size '+this.img_[0].naturalWidth + ' x ' + this.img_[0].naturalHeight);
    this.cont.nW = this.img_[0].naturalWidth;
    this.cont.nH = this.img_[0].naturalHeight;
    this.cont.rW = this.cont.nW / this.cont.width();
    this.cont.rH = this.cont.nH / this.cont.height();
  },

  // Load image in mini-canvas
  updateBuffer: function() {

    this.buffer = document.getElementById('buffer'),
    this.bu_ctx = buffer.getContext('2d');

    this.buffer.width = this.img_[0].naturalWidth;
    this.buffer.height = this.img_[0].naturalHeight;
    this.bu_ctx.drawImage (this.img_[0], 0, 0);
  },

  // Reordena en escalera los crops
  sortCrop: function () {
    // Initial crop positions
    var
      i = 1,
      offset = 32,
      step = 32;
    this.crops.each(function(idx, el){
      $(el).css({
        'top': i * step + offset,
        'left': i * step + offset
      });
      i++;
    });
  },

  // Add croptmark
  addCropMark: function(cw, ch) {
    var
      col = IC.rainbow(),
      offset = 32,
      step = 32,
      c = $('.crop-mark').length,
      pos = c * step + offset,
      crop = $('<div id="cm-'+cw+'-'+ch+'" class="crop-mark hidden" data-w="'+cw+'" data-h="'+ch+'" style="width:'+cw+'px;height:'+ch+'px;border-color:'+col.toRgbaString()+';background:'+col.alpha(.25).toRgbaString()+';top:'+pos+'px;left:'+pos+'px;"><span>'+cw+':'+ch+'</span><a href="" class="del">X</div>');

    // Add to DOM
    crop.appendTo(this.cont);

    // Resizeable an draggable
    crop.draggable({containment:"parent"}).resizable({ containment: "parent", "aspectRatio": true }).removeClass('hidden');

    // Autoexpand on double clicking
    crop.dblclick(function(el) {
      var
        ratio_c = $(this).width() / $(this).height(),
        ratio_i = IC.img_.width() / IC.img_.height();

      if (ratio_c > ratio_i) {
        $(this).width(IC.img_.width());
        $(this).height(IC.img_.width()*(1/ratio_c));
      } else {
        $(this).height(IC.img_.height());
        $(this).width(IC.img_.height()*ratio_c);
      }

      // Center
      $(this).position({
        my: "center",
        at: "center",
        of: IC.cont
      });
    });

    // Update general selector
    this.crops = $('.crop-mark');
  },


  // Crop all marks
  cropAllMarks: function () {
    this.crops = $('.crop-mark');

    this.crops.each(function(idx, item){
      var
        b = 1, // Border
        sw = 0,
        sh = 0,
        sx = 0,
        sy = 0,
        parent_x = parseInt(IC.cont.css('padding-left'), 10),
        parent_y = parseInt(IC.cont.css('padding-top'), 10),
        $i = $(item),
        dw = parseInt($i.data('w'), 10),
        dh = parseInt($i.data('h'), 10),
        line = '',
        id = Math.random().toString(16).slice(2);

      sw = Math.round($i.width()*IC.cont.rW);
      sh = Math.round($i.height()*IC.cont.rH);
      sx = Math.round(($i.position().left-parent_x)*IC.cont.rW);
      sy = Math.round(($i.position().top-parent_y)*IC.cont.rH);
      line = $i[0].id + ' sw:' + sw + ' sh:' + sh + ' sx:' + sx + ' sy:' + sy + "\n";

      IC.log.append(line);

      // Create crops
      $('<div class="result-crop"><canvas id="cnv-'+id+'">&nbsp;</canvas><a href="#" id="dwn-'+id+'" class="btn dwn-link" download="crop-'+idx+'.jpg" title="Click to download this crop as JPEG">SAVE JPEG</a><a href="#" class="btn btn-close">X</a></div>').appendTo(IC.re);

      $('#cnv-'+id)[0].width = dw;
      $('#cnv-'+id)[0].height = dh;

      var cnv = $('#cnv-'+id)[0],
        ctx = cnv.getContext('2d');
      ctx.drawImage($('#src')[0], sx, sy, sw, sh, 0, 0, dw, dh);

      $('<input type="hidden" name="image_crop[][file]" value="'+cnv.toDataURL('image/jpeg')+'" />').appendTo(IC.crops_form);
      // ctx.drawImage($('#buffer')[0], sx, sy, sw, sh, 0, 0, dw, dh);

      // Filter the crops
      IC.filterTheCrop(ctx, sw, sh, dw, dh);
    });


    // Download buttons
    $('.dwn-link').off().on('click', function(el) {
      var dt = $(this).parent().find('canvas')[0].toDataURL('image/jpeg');
      $(this)[0].href = dt;
    });

    // Close buttons
    $('.btn-close').off().on('click', function(){
      $(this).parent().remove();
    });
  },


  // Filtering the crop
  filterTheCrop: function(ctx, sw, sh, dw, dh) {
    var imgData = ctx.getImageData(0,0,dw,dh);

    // Shaarpen
    if ($('#fltr-sharpen').is(':checked')) {
      sharpen = IC.calculateASharpnessFactor(sw, sh, dw, dh);
      // console.log(sharpen);
      var matrix =
      [  -1, -2,  -1,
         -2,  sharpen + 12,  -2, //Sharpen
         -1, -2,  -1 ];
      // console.log(matrix);
      matrix = $.map(matrix, function (v) {
        return v / sharpen;
      });
      // console.log(matrix);
      imgData = Filters.convolute(imgData,matrix);
    }

    // Greyscale
    if ($('#fltr-greyscale').is(':checked')) {
      imgData = Filters.grayscale(imgData);
    }

    // Autolevels
    if ($('#fltr-autolevels').is(':checked')) {
      imgData = Filters.autoLevels(imgData);
    }

    // Putback to canvas
    ctx.putImageData(imgData,0,0);
  },


  // 30 random hues with step of 12 degrees
  rainbow: function() {
    var hue = Math.floor(Math.random() * 30) * 12;

    return $.Color({
      hue: hue,
      saturation: 0.9,
      lightness: 0.6,
      alpha: 1
    }); //.toRgbaString()
  },

  /**
   * [flipH description]
   * @return {[type]} [description]
   */
  flipH: function() {
    var c = document.createElement('canvas');
    var ctx = c.getContext('2d');
    c.width = IC.buffer.width;
    c.height = IC.buffer.height;

    // Copy
    ctx.drawImage(IC.buffer, 0, 0, c.width, c.height);
    IC.bu_ctx.scale(1,-1);
    IC.bu_ctx.drawImage(c, 0, 0, c.width, c.height);

  },

  /**
   * Calculates sharpness factor to be used to sharpen an image based on the
   * area of the source image and the area of the destination image
   *
   * @since 2.0
   * @author Ryan Rud
   * @link http://adryrun.com
   *
   * @param integer $sourceArea Area of source image
   * @param integer $destinationArea Area of destination image
   * @return integer Sharpness factor
   */
  calculateASharpnessFactor: function (sw, sh, dw, dh) {
    var
      final = Math.sqrt(dw*dh) * (750.0 / Math.sqrt(sw*sh)),
      a = 52,
      b = -0.27810650887573124,
      c = 0.00047337278106508946,
      result = a + b * final + c * final * final;

    return Math.max(Math.round(result), 0);
  }
};


