define("spectrum/pagetreeHelper", ['jquery','livelist/livelist'], function($, livelist){

  function callback(type){
      this["shift+enter"] = function(item){
          location.href="/" + type + "/" + item.title;
      }
      this["cmd:delete"] = function(item, $item){
          var redirectTarget = livelist.nestedSerializer.itemToJson($item.next()).title;
          location.href="/" + type + "/" + item.title + "/_delete?redirect=" + "/" + type + "/" + redirectTarget;
      }
  }
  var pagetreeHelper = {
    bindLivelist: function(){ // render page tree
      $.ajax({
        url: "/pages",
        context: document.body
      }).done(function(data) {
        var list = livelist.nestedSerializer.jsonToLive(data, "root");
        $("#pages").html(list);
        livelist("#pages .root", new callback("pages"));
      });

      $.ajax({
        url: "/features",
        context: document.body
      }).done(function(data) {
        var list = livelist.nestedSerializer.jsonToLive(data, "root");
        $("#features").html(list);
        livelist($("#features .root"), new callback("features"));
      });
      slidePanels();

      function slidePanels(){
        $("#header").click(function() {
          if($("#left-panel").hasClass("expand")){
              $("#left-panel").animate({ width: "20%" }, 200).removeClass("expand");
          }else{
              $("#left-panel").addClass("expand").animate({ width: "60%"}, 200);
          }
        });
      }
    }
  };

  return pagetreeHelper;

});
