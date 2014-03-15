define("spectrum/pagetreeHelper", ['jquery','livelist/livelist'], function($, livelist){

    var pagetreeHelper = {
      bindLivelist: function(){ // render page tree
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
            }else{
                $("#left-panel").addClass("expand").animate({ width: "60%"}, 200);
            }
          });
        }
      }
    }
    return pagetreeHelper;

});
