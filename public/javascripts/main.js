
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
  'ace/ace',
  'ace/mode/coffee',
  'ace/theme/solarized_dark',
  'ace/mode/gherkin-en',
  'showdown',
  'sharejs',
  'gherkin/lexer/en'
  ], function($, ace, modeCoffee, themeSolarizedDark, modeGherkin) {

    $(document).ready(function() {
      renderPagetree();
      var editor = window.ae = createEditor(ace, docName);

      window.ace = ace;  // sharejs/ace depend on variable window.ace
      require(['sharejs/ace'], function(){
        shareEditor(editor, docName);
      });

      require([
        'jquery',
        'jquery.ui.widget',
        'fileupload/jquery.iframe-transport',
        'fileupload/jquery.fileupload',
        'toastr'], function() {
        bindFileUpload(editor);
      })

      slidePanels();

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

  return editor;
}

function shareEditor(editor, docName){
  var converter = new Showdown.converter();

  var Lexer = require('gherkin/lexer/en');
  var output = [];
  var listener = {
    comment: function(value, line) {
      console.log(value);
    },
    tag: function(value, line) {
      output.push('<button type="button" class="btn btn-xs btn-primary">' + value + '</button>');
    },
    feature: function(keyword, name, description, line) {
      output.push("<h2>" + name + "</h2>");
      output.push(converter.makeHtml(description));
      output.push("<p><hr></p>");
    },
    background: function(keyword, name, description, line) {
      output.push("<h3>" + keyword + ': ' + name + "</h3>");
    },
    scenario: function(keyword, name, description, line) {
      output.push("<h3>" + name + "</h3>");
      output.push("<h3>" + description + "</h3>");
    },
    scenario_outline: function(keyword, name, description, line) {
      output.push("<h3>" + name + "</h3>");
      output.push("<h3>" + description + "</h3>");
    },
    examples: function(keyword, name, description, line) {
      console.log('  ' + keyword + ': ' + name);
    },
    step: function(keyword, name, line) {
      output.push("<b>" + keyword + "</b> "+ name + "<br/>");
    },
    doc_string: function(content_type, string, line) {
      output.push('<pre>      """\n' + string + '\n      """</pre>');
    },
    row: function(row, line) {
      console.log('      | ' + row.join(' | ') + ' |');
    },
    eof: function() {
      console.log('=====');
    }
  };
  var lexer = new Lexer(listener);

  var connection = new sharejs.Connection('/channel');

  connection.open(docName, function(error, doc) {
    if (error) {
        console.error(error);
        return;
    }
    doc.attach_ace(editor);
    editor.setReadOnly(false);

    var render = function() {
        output = ["<p>&nbsp;</p>"];
        lexer.scan(doc.snapshot);
        //view.innerHTML = converter.makeHtml(doc.snapshot);
        view.innerHTML = output.join(" ");

    };

    render();
    doc.on('change', render);
  });
}

function slidePanels(){
  /*
  setTimeout(function(){
    $("#editor").animate({ left: "94%" }, 700);
    $("#left").animate({ width: "76%" }, 900);
  }, 1000)

*/

  var toggle = false;
  $("#header").click(function() {

    if(toggle){
        //$("#editor").animate({ left: "94%" }, 300);
        $("#left-panel").animate({ width: "20%" }, 200);
        toggle = false;
    }else{
        //$("#editor").animate({ left: "60%" }, 300);
        $("#left-panel").animate({ width: "60%"}, 200);
        toggle = true;
    }
  });

}


function renderPagetree(){ // render page tree
  $.ajax({
    url: "/pages",
    context: document.body
  }).done(function(data) {
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
