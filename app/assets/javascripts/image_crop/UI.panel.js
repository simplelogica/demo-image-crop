$.fn.UI_panel = function() {
  return this.each(function() {
    new panel(this);
  });
  function panel(el){
    var
      panel = $(el),
      tabs = panel.find('.tabs > li:not(.close-panel)'),
      links = tabs.find('>a'),
      contents = panel.find('.content > div');

    // Init
    contents.hide();
    contents.first().show();
    tabs.first().addClass('active');

    // Tabs event
    links.on('click', function(e){
      e.preventDefault();
      tabs.removeClass('active');
      $(this).parent().addClass('active');

      // Contents
      contents.hide();
      var idx = $(this).attr('href').replace('#','');
      panel.find('.content > div:nth-child('+idx+')').show();
    });

    // Expand / collapse panel
    panel.find('.close-panel > a').on('click', function(e){
      e.preventDefault();
      panel.toggleClass('closed');
    });

  }
};


$('.panel > .tabs > li:not(.close-panel) > a').on('click', function(e){
  e.preventDefault();
  $(this).parents('.panel').find('.tabs > li').removeClass('active');
  $(this).parent().addClass('active');
  // Contents
  $(this).parents('.panel').find('.content > div').hide();
  var idx = $(this).attr('href').replace('#','');
  $(this).parents('.panel').find('.content > div:nth-child('+idx+')').show();
  // console.log(idx);

});

