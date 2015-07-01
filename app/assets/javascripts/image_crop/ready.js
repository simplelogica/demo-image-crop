// — FUNCIONES LOCALES A ESTE SITE
$(document).ready(function() {
  // la magia aquí

  // UI

  // Panel tabs
  $('.panel').UI_panel();

  // Initialize
  IC.init();
  // IC.img_[0].src="../img/949d96c7e1d42a768fed46b838226e3b.jpg";

  // Crop button
  $('#master-crop').on('click', function(el) {
    el.preventDefault();
    IC.cropAllMarks();
  });

  $('#delete-all-crops').on('click', function(e) {
    e.preventDefault();
    IC.re.html('');
    IC.log.text('');
  });

  // Input file button
  $('#input-file').on('change', function(){
    var
      file = $(this)[0].files[0],
      fr = new FileReader();
    fr.onload = function (e) {
      IC.img_[0].src = fr.result;
    };
    fr.readAsDataURL(file);
  });

  // Load file button
  $('#load-file-from-computer').on('click', function(){
    $('#input-file').click();
  });

  $('.checkable').on('click',function(el){
    $(this).toggleClass('checked');
  });

  // Load file from button
  $('#load-file-from-url').on('click', function(){
    var url = prompt("Please enter the full URL","");
    // Avoid cross domain limitations
    if (url) {
      IC.img_[0].src = 'getimage.php?u='+encodeURI(url);
    };
  });

  // External links ---------------------------------------
  //externalLinks();



});
