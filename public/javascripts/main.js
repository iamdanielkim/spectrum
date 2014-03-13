
require.config({
  baseUrl: "/javascripts",
  paths: {
    "jquery": "/jquery/dist/jquery.min",
    "jquery.ui.widget": "/jquery-ui/ui/jquery.ui.widget",
    "fileupload": "/blueimp-file-upload/js",
    "toastr": "/toastr/toastr",
    "gherkin": "gherkin",
    "ace/mode/gherkin-en": "gsh/ace/mode-gherkin-en",
    "showdown": "markdown/showdown",
    "sharejs": "webclient/share.uncompressed",
    "sharejs/ace": "webclient/ace"
}})

require([
  'jquery',
  'ace/mode/gherkin-en',
  'showdown',
  'sharejs',
  'gherkin/lexer/en',
  'livelist/livelist',
  'spectrum/gherkin/htmlconverter'
  ], function($, themeSolarizedDark, modeGherkin) {

    $(document).ready(function() {
      renderPagetree(require("livelist/livelist"));

      var editor = createEditor(ace, docName);

      require([
        'jquery',
        'jquery.ui.widget',
        'fileupload/jquery.iframe-transport',
        'fileupload/jquery.fileupload',
        'toastr'], function() {
        bindFileUpload(editor);
      });
    });
});

function createEditor(ace, docName){
  var view = document.getElementById('view');

  var editor = ace.edit("editor");
  //editor.setTheme("ace/theme/solarized_dark");
  var GherkinMode = require('ace/mode/gherkin-en').Mode;

  editor.renderer.setShowGutter(false);
  editor.getSession().setMode(new GherkinMode());
  editor.getSession().setTabSize(2);

  editor.setReadOnly(false);
  editor.session.setUseWrapMode(true);
  editor.setShowPrintMargin(true);
  $("#editor").removeClass("init");

  require(['sharejs/ace'], function(){
    shareEditor(editor, docName);
  });
  return editor;
}

function shareEditor(editor, docName){
  var GherkinHtmlConverter = require('spectrum/gherkin/htmlconverter');

  var connection = new sharejs.Connection('/channel');
  connection.open(docName, function(error, doc) {
    if (error) {
        console.error(error);
        return;
    }
    doc.attach_ace(editor);
    editor.setReadOnly(false);

    var render = function() {
      var gherkinHtmlConverter = new GherkinHtmlConverter(new Showdown.converter());
      view.innerHTML = gherkinHtmlConverter.parse(editor.getValue());
//        lexer.scan(doc.snapshot);
//        view.innerHTML = converter.makeHtml(doc.snapshot);
    };

    render();
    doc.on('change', render);
  });
}

function renderPagetree(livelist){ // render page tree
  $.ajax({
    url: "/pages",
    context: document.body
  }).done(function(data) {
    var list = livelist.serializer.jsonToLive(data, "root");
    $("#pages").html(list);
    livelist("#pages .root", {
        "shift+enter": function(item){
            location.href="/pages/" + item.title;
        }
    });
  });

  $.ajax({
    url: "/features",
    context: document.body
  }).done(function(data) {
    var list = livelist.serializer.jsonToLive(data, "root");
    $("#features").html(list);
    livelist($("#features .root"), {
        "shift+enter": function(item){
            location.href="/features/" + item.title;
        }
    });
  });
  slidePanels();

  function slidePanels(){
    $("#header").click(function() {
      if($("#left-panel").hasClass("expand")){
          $("#left-panel").animate({ width: "20%" }, 200).removeClass("expand");
          toggle = false;
      }else{
          $("#left-panel").addClass("expand").animate({ width: "60%"}, 200);
          toggle = true;
      }
    });
  }
}

function bindFileUpload(editor) { // file upload
  $('#fileupload').fileupload({
    dataType: 'json',
    progress: function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('#progress .bar').css(
            'width',
            progress + '%'
        );
    },
    done: function (e, data) {
        var filename = data.files[0].name;
        toastr.success("Upload Complete :D")
        editor.splitLine()
        editor.splitLine()
        editor.navigateDown(1)
        editor.navigateLineStart()

        editor.insert(
            "!["+ filename + "](/attachments/" + filename +")"
        );
    }
  });
}
