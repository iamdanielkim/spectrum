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
        editor = ace.edit("editor");
        editor.renderer.setShowGutter(false);
        editor.setReadOnly(false);
        editor.setShowPrintMargin(true);
        setupEditorSession(editor.session);

        setup(docName);
        return editor;
      };

      this.rebind = function(docName, contents){
        var session = new ace.EditSession(contents);
        setupEditorSession(session);
        editor.setSession(session);

        setup(docName);
      };

      function setupEditorSession(session){
        var GherkinMode = require('ace/mode/gherkin-en').Mode;
        session.setUndoManager(new ace.UndoManager());
        session.setMode(new GherkinMode());
        session.setTabSize(2);
        session.setUseWrapMode(true);
      }

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
        var view = document.getElementById('view');
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
