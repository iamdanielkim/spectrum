define("spectrum/pagetreeHelper", ['jquery','livelist/livelist'], function($, livelist){

  function callback(type){
      this["item:selected"] = function(item, $item){
        var title = item.title;
        if(title){
          History.pushState({type: type, item: item}, title, "/" + type + "/" + encodeURIComponent(title));
          $(".selected").removeClass("selected");
          $item.addClass("selected");
        }
      }
      this["shift+enter"] = function(item){
        if(item.title){
          location.href="/" + type + "/" + item.title;
        }
      }
      this["cmd:delete"] = function(item, $item){
        var redirectTarget = livelist.nestedSerializer.itemToJson($item.next()).title;
        location.href="/" + type + "/" + item.title + "/_delete?redirect=" + "/" + type + "/" + redirectTarget;
      }
  }


/*
  function modifyItem(target){
    $(target + " [status='_modified']").each(function(){
      var $item = $(this);
      var title = $(this).find(".title").text().trim();
      if(title){
        $.ajax({
          url: "" + encodeURIComponent(title),
          context: document.body
        }).done(function(data) {
          $item.removeAttr("status");
        });
      }
    });
  }
*/
  var pagetreeHelper = {
    bindLivelist: function(){ // render page tree
      $.ajax({
        url: "/pages",
        context: document.body
      }).done(function(data) {
        var list = livelist.nestedSerializer.jsonToLive(data, "root");
        $("#pages").html(list);
        $('[title="' + docName.split(":")[1] +'"]').addClass("selected");
        livelist("#pages .root", new callback("pages"));
      });

      $.ajax({
        url: "/features",
        context: document.body
      }).done(function(data) {
        var list = livelist.nestedSerializer.jsonToLive(data, "root");
        $("#features").html(list);
        $('[title="' + docName.split(":")[1] +'"]').addClass("selected");
        livelist($("#features .root"), new callback("features"));
      });

      History.Adapter.bind(window,'statechange',function(){
          var state = History.getState();
          var type = state.data.type, item = state.data.item;
          var title =item.title;

          $.ajax({
            url: "/" + type + "/" + encodeURIComponent(title) + "?format=raw",
            context: document.body
          }).done(function(data) {
            var docName = (type == "features" ? "feature:" : "wiki:") + title;
            app.editorHelper.rebind(docName , data);

            $(".selected").removeClass("selected");
            $('[title="' + docName.split(":")[1] +'"]').addClass("selected");
          });
      });

      setInterval(function(){
        createItem("#pages", "pages");
        createItem("#features", "features");
      }, 3000);

      slidePanels();

      function createItem(target, path){
        $(target + " [status='_created']").each(function(){
          var $item = $(this);
          var title = $(this).find(".title").text().trim();
          if(title){
            $.ajax({
              url: "/" + path + "/" + encodeURIComponent(title),
              context: document.body
            }).done(function(data) {
              $item.removeAttr("status");
            });
          }
        });
      }

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
