define("spectrum/editorHelper", [
  'jquery',
  'spectrum/gherkin/htmlconverter',
  'ace/mode/gherkin-en',
  // export to window
  'showdown',
  'sharejs'],
  function($, GherkinHtmlConverter, GherkinMode){

  var EditorHelper = function(ace, docName){
      this.create = function(){
        var view = document.getElementById('view');

        var editor = window.editor = ace.edit("editor");
        //editor.setTheme("ace/theme/solarized_dark");
        editor.renderer.setShowGutter(false);
        var GherkinMode = require('ace/mode/gherkin-en').Mode;
        editor.getSession().setMode(new GherkinMode());
        editor.getSession().setTabSize(2);

        editor.setReadOnly(false);
        editor.session.setUseWrapMode(true);
        editor.setShowPrintMargin(true);
        render(editor, true);

        $("#editor").removeClass("init");
        setTimeout(function(){
          editor.getSession().setScrollTop(0);
        }, 400);

        require(['sharejs/ace'], function(){
          applySharejs(editor, docName);
        });
        return editor;
      };

      function applySharejs(editor, docName){
        var connection = new sharejs.Connection('/channel');
        connection.open(docName, function(error, doc) {
          if (error) {
              console.error(error);
              return;
          }
          doc.attach_ace(editor);
          doc.on('change', function(){
            render(editor);
          });
        });
      }

      function render(editor, init) {
        try{
//          var GherkinHtmlConverter = require('spectrum/gherkin/htmlconverter');
          var gherkinHtmlConverter = new GherkinHtmlConverter(new Showdown.converter());
          view.innerHTML = gherkinHtmlConverter.parse(editor.getValue());
          //        view.innerHTML = converter.makeHtml(doc.snapshot);
        }catch(e){
          if(init){
            view.innerHTML = e.toString();
          }
          console.log(e);
        }
      }
  };
  return EditorHelper;
});
