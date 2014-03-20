define("spectrum/editorHelper", [
  'jquery',
  'spectrum/gherkin/htmlconverter',
  'ace/mode/gherkin-en',
  // export to window
  'showdown',
  'sharejs'],
  function($, GherkinHtmlConverter, GherkinMode){

  var EditorHelper = function(ace){
      var editor;
      var sharejsDoc;
      var connection;


      this.create = function(docName){
        var view = document.getElementById('view');

        editor = ace.edit("editor");
        //editor.setTheme("ace/theme/solarized_dark");
        editor.renderer.setShowGutter(false);
        var GherkinMode = require('ace/mode/gherkin-en').Mode;
        editor.getSession().setMode(new GherkinMode());
        editor.getSession().setTabSize(2);
        editor.setReadOnly(false);
        editor.session.setUseWrapMode(true);
        editor.setShowPrintMargin(true);

        setup(docName);
        return editor;
      };



      this.rebind = function(docName, contents){
        console.log(contents);
        editor.setValue(contents);
        setup(docName);
      };

      function setup(docName){
        sharejsDoc && sharejsDoc.detach_ace && sharejsDoc.detach_ace();
        connection && connection.disconnect();

        renderViewer(docName, editor);

        $("#editor").removeClass("init");
        setTimeout(function(){
          editor.getSession().setScrollTop(0);
        }, 400);

        require(['sharejs/ace'], function(){
          connection = new sharejs.Connection('/channel');
          connection.open(docName, function(error, doc) {
            if (error) {
                console.error(error);
                return;
            }
            doc.attach_ace(editor);
            doc.on('change', function(){
              renderViewer(docName, editor);
            });
            sharejsDoc = doc;
          });
        });
      }

      function renderViewer(docName, editor) {
        var type = docType(docName);
        try{
          var converter = new Showdown.converter();
          if(type == "gherkin"){
            var gherkinHtmlConverter = new GherkinHtmlConverter(converter);
            view.innerHTML = gherkinHtmlConverter.parse(editor.getValue());
          }else if(type == "markdown"){

            view.innerHTML = converter.makeHtml(editor.getValue());
          }
          $("#console").html("");
        }catch(e){
          $("#console").html(e);
        }

        function docType(docName){
          if(docName.indexOf("feature:") != -1){
            return "gherkin";
          }else{
            return "markdown";
          }
        }
      }
  };
  return EditorHelper;
});
