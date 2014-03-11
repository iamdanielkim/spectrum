
require.config({paths: {
    "jquery": "/jquery/dist/jquery.min",
    "jquery.ui.widget": "/jquery-ui/ui/jquery.ui.widget",
    "ace": "/ace/lib/ace",
    "gherkin": "/javascripts/gherkin",
    "fileupload": "/blueimp-file-upload/js",
    "toastr": "/toastr/toastr",
    "ace/mode/gherkin-en": "/javascripts/gsh/ace/mode-gherkin-en",
    "showdown": "/javascripts/markdown/showdown",
    "bcsocket": "/javascripts/bcsocket",
    "sharejs": "/javascripts/webclient/share.uncompressed",
    "sharejs/ace": "/javascripts/webclient/ace"
}})

require([
  'jquery',
  'gherkin/lexer/en',
  'ace/ace',
  'ace/mode/coffee',
  'ace/theme/solarized_dark',
  'ace/mode/gherkin-en',
  'showdown',
  'sharejs'
  ], function($, lexer, ace, modeCoffee, themeSolarizedDark, modeGherkin) {

    $(document).ready(function() {

      var editor = window.ae = createEditor(ace, docName);

      // sharejs/ace depend on variable window.ace
      window.ace = ace;
      require(['sharejs/ace'], function(){
        shareEditor(editor, docName);
      });

      require(['jquery', 'jquery.ui.widget','fileupload/jquery.iframe-transport', 'fileupload/jquery.fileupload', 'toastr'], function() {
        bindFileUpload(editor);
      })

      slidePanels();
      renderPagetree();
    });
});

function createEditor(ace, docName){
  var view = document.getElementById('view');

  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/solarized_dark");
  var GherkinMode = require('ace/mode/gherkin-en').Mode;
  editor.getSession().setMode(new GherkinMode());
  editor.getSession().setTabSize(2);

  editor.setReadOnly(false);
  editor.session.setUseWrapMode(true);
  editor.setShowPrintMargin(true);

  return editor;
}

function shareEditor(editor, docName){
  var converter = new Showdown.converter();
  var connection = new sharejs.Connection('/channel');

  connection.open(docName, function(error, doc) {
    if (error) {
        console.error(error);
        return;
    }
    doc.attach_ace(editor);
    editor.setReadOnly(false);

    var render = function() {
        view.innerHTML = converter.makeHtml(doc.snapshot);
    };

    render();
    doc.on('change', render);
  });
}

function slidePanels(){
  setTimeout(function(){
    $("#editor").animate({ left: "94%" }, 700);
    $("#left").animate({ width: "76%" }, 900);
  }, 1000)

  var toggle = false;
  $("#left").click(function() {

    if(toggle){
        $("#editor").animate({ left: "94%" }, 300);
        $("#left").animate({ width: "76%" }, 500);
        toggle = false;
    }else{
        $("#editor").animate({ left: "60%" }, 300);
        $("#left").animate({ width: "40%"}, 500);
        toggle = true;
    }
  });
}


function renderPagetree(){ // render page tree
  $.ajax({
    url: "/pages",
    context: document.body
  }).done(function(data) {
    console.log(livelistSerializer)
    var list = livelistSerializer.jsonToLive(data, "root");
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
    var list = livelistSerializer.jsonToLive(data, "root");
    $("#features").html(list);
    livelist($("#features .root"), {
        "shift+enter": function(item){
            location.href="/features/" + item.title;
        }
    });
  });
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
