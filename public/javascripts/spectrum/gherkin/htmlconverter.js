define("spectrum/gherkin/htmlconverter", ['gherkin/lexer/en'], function(Lexer){

  return function(markdownConverter){

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
        output.push(markdownConverter.makeHtml(description));
        output.push("<p><hr></p>");
      },
      background: function(keyword, name, description, line) {
        background.push("<h3>Background " + name + "</h3>");
        insideBackground = true;
      },
      scenario: function(keyword, name, description, line) {
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
        scenario.push("<h5>" + keyword + ': ' + name + "</h5>");
      },
      step: function(keyword, name, line) {
        if(insideBackground){
          background.push("<dt>" + keyword + "</dt> <dd>"+ name.replace("<","&lt;") + "</dd>");
          console.log("A")
        }else{
          scenario.push("<dt>" + keyword + "</dt> <dd>"+ name.replace("<","&lt;") + "</dd>");
        }
      },
      doc_string: function(content_type, string, line) {
        scenario.push('<pre>' + string + '</pre>');
      },
      row: function(row, line) {
        scenario.push('<pre class="table">   | ' + row.join(' | ') + ' |\n</pre>');
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

    this.parse = function(gherkinDocument){
      lexer.scan(gherkinDocument);
      var result = output.join(" ");
      clean();
      return result;
    }

    var lexer = new Lexer(this.listener);

    function clean(){
      feature = [];
      background = [];
      scenario = [];
      table = [];
      output = [];
    }
  };

});
