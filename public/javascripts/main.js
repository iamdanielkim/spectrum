
require.config({paths: {
    "jquery": "/jquery/dist/jquery.min",
    "jquery.ui.widget": "/jquery-ui/ui/jquery.ui.widget",
    "ace/ace": "/ace-builds/src/ace",
    "ace/mode/coffee": "/ace-builds/src/mode-coffee",
    "ace/theme/solarized_dark": "/ace-builds/src/theme-solarized_dark",
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
      /*require(['sharejs/ace'], function(){
        shareEditor(editor, docName);
      });
      */
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
  $("#editor").removeClass("init");
  return editor;
}

function shareEditor(editor, docName){
  var converter = new Showdown.converter();


  var Parser = function(){

    var feature = [];
    var background = [];
    var scenario = [];
    var table = [];

    var output = [];

    var insideScenario = false, insideBackground = false;
    this.listener = {
      comment: function(value, line) {
        //console.log(value);
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
        background.push("<h3>Background " + name + "</h3>");
        insideBackground = true;
      },
      scenario: function(keyword, name, description, line) {
        if(insideBackground){
          output.push(background.join(" "));
          output.push("<h3>Examples</h3>");
          background = [];
          insideBackground = false;
        }
        if(insideScenario){
          output.push("<fieldset class='scenario'>" + scenario.join(" ") + "</fieldset>");
          scenario = [];
          insideScenario = false;
        }
        scenario.push("<legend><h4>" + name + "</h4></legend>");
        scenario.push("" + description + "");
        insideScenario = true;

      },
      scenario_outline: function(keyword, name, description, line) {
        if(insideBackground){
          output.push(background.join(" "));
          background = [];
          insideBackground = false;
        }
        if(insideScenario){
          output.push("<fieldset class='scenario'>" + scenario.join(" ") + "</fieldset>");
          scenario = [];
          insideScenario = false;
        }
        scenario.push("<legend><h4>" + name + "</h4></legend>");
        scenario.push("" + description + "");
        insideScenario = true;
      },
      examples: function(keyword, name, description, line) {
        scenario.push("<h4>" + keyword + ': ' + name + "</h4>");
      },
      step: function(keyword, name, line) {
        if(insideBackground){
          background.push("<dt>" + keyword + "</dt> <dd>"+ name + "</dd>");
          console.log("A")
        }else{
          scenario.push("<dt>" + keyword + "</dt> <dd>"+ name + "</dd>");
        }
      },
      doc_string: function(content_type, string, line) {
        scenario.push('<pre>' + string + '</pre>');
      },
      row: function(row, line) {
        scenario.push('      | ' + row.join(' | ') + ' |');
      },
      eof: function() {
        if(insideScenario){
          output.push("<fieldset class='scenario'>" + scenario.join(" ") + "</fieldset>");
          scenario = [];
          insideScenario = false;
        }
        console.log('=====');
      }
    };
    this.render = function(){
      var result = output.join(" ");
      output = [];
      return result;
    };
  };

  var Lexer = require('gherkin/lexer/en');

  var connection = new sharejs.Connection('/channel');
  connection.open(docName, function(error, doc) {
    if (error) {
        console.error(error);
        return;
    }
    doc.attach_ace(editor);
    editor.setReadOnly(false);

    var render = function() {
       var parser = new Parser();
        var lexer = new Lexer(parser.listener);
//      lexer.scan(editor.getValue());
        lexer.scan(doc.snapshot);

        //view.innerHTML = converter.makeHtml(doc.snapshot);
        view.innerHTML = parser.render();

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
        $("#left-panel").animate({ width: "20%" }, 200).removeClass("expand");
        toggle = false;
    }else{
        //$("#editor").animate({ left: "60%" }, 300);
        $("#left-panel").addClass("expand").animate({ width: "60%"}, 200);

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
