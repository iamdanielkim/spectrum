
define("spectrum/gnbHelper", ['jquery'], function($){
  $(function ($) {
      $('div.btn-group[data-toggle-name]').each(function () {
          var group = $(this);
          $('button', group).each(function () {
              var button = $(this);
              button.on('click', function (ev) {
                ev.stopPropagation();

                switch($(this).val()){
                case 'L':
                  $("body").addClass("expand-editor").removeClass("expand-viewer");
                  break;
                case 'M':
                  $("body").removeClass("expand-editor").removeClass("expand-viewer");
                  break;
                case 'R':
                  $("body").removeClass("expand-editor").addClass("expand-viewer");
                  break;
                }
                setTimeout(function(){
                  app.editor.resize();
                },20);
                $('div.btn-group[data-toggle-name] button').removeClass('active');
                button.addClass('active');
              });
          });
      });
  });
});
