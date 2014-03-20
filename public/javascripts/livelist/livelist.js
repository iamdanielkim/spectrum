
define("livelist/livelist", ["jquery"], function($){

  var livelist = function (hook, callback){
    callback =  callback || {};

    $(".item", hook).on("click", function(ev){
      var $item = $(this);

      callback["itemClick"] && callback["itemClick"](livelistNestedSerializer.itemToJson($item), $item);
      ev.stopPropagation();
    })

    $(".item", hook).on("mouseenter", function(ev){
      var el = ev.currentTarget;
      $(".hover", hook).removeClass("hover");
      $(el).addClass("hover");

      ev.stopPropagation();
    }).on("mouseleave", function(ev){
      var el = ev.currentTarget;

      $(".hover", hook).removeClass("hover");
      $(ev.relatedTarget).parent().addClass("hover");
    });

    $(".icon", hook).on("click", function(ev){
      var icon = ev.currentTarget;
      var $parent = $(icon).parent();
      if($parent.hasClass("expand")){
        $parent.removeClass("expand");
      }else{
        $(".expand", hook).removeClass("expand");
        $parent.addClass("expand");
      }
      ev.stopPropagation();
    });

    $(".item .commands .open", hook).on("click", function(ev){
      var open = ev.currentTarget;
      var $item = $(open).parent().parent();

      callback["shift+enter"] && callback["shift+enter"](livelistNestedSerializer.itemToJson($item));
      ev.stopPropagation();
    });

    $(".item .commands .delete", hook).on("click", function(ev){
      var open = ev.currentTarget;
      var $item = $(open).parent().parent();

      callback["cmd:delete"] && callback["cmd:delete"](livelistNestedSerializer.itemToJson($item), $item);
      ev.stopPropagation();
    });


    var i = 0;
    $(hook).keydown(function(ev){
      $(" .hover", hook).removeClass("hover");

      if(ev.shiftKey && ev.keyCode == 9){ // shift+tab
        ev.preventDefault();
        var $item = $(ev.target).parent().parent();
        var $tree = $item.parent();
        var $parentItem = $tree.parent();

        if($(hook).find($parentItem).size() == 0) return;

        $parentItem.after($item);
        if($tree.children() == 0){
          $tree.remove();
        }
        focus($item.find(".title-wrap .title"));
      }else if(ev.shiftKey && ev.keyCode == 13){ // shift+enter
        ev.preventDefault();
        var $span = $(ev.target);
        var $item = $span.parent().parent();
        callback["shift+enter"] && callback["shift+enter"](livelistNestedSerializer.itemToJson($item));

      }else if(ev.keyCode == 9){ // tab
        ev.preventDefault();
        var $item = $(ev.target).parent().parent();
        var $prevItem = $item.prev();

        var $tree;
        if($("> .tree", $prevItem).size() != 0){
          $tree = $("> .tree", $prevItem);
        }else{
          $prevItem.append(newTree());
          $tree = $("._new");
        }

        $tree.append($item).removeClass("_new");

        focus($item.find(".title-wrap > .title"));

      }else if(ev.keyCode == 13){ // enter
        ev.preventDefault();
        var $item = $(ev.target).parent().parent();

        if(isCaretInFront()){
          //caret이 맨 앞에 있음 위에 삽입. caret은 현재 li 그대로
          newItemBefore($item);
          focus($item.find(".title-wrap > .title"));
        }else if(hasChildren($item)){
          //child가 있을 경우, child로 생성
          var $tree = $item.find(".tree");
          newItemInside($tree);
          focus($tree.find(".item:first-child .title-wrap > .title"));
        }else{
          //기본 동작은 sibliing으로 생성
          newItemAfter($item);
          var $nextItem = $item.next();
          focus($nextItem.find(".title-wrap > .title"));
        }

      }else if(ev.keyCode == 38){ //up
        ev.preventDefault();
        var $item = $(ev.target).parent().parent();
        var $prevItem;

        if($item.prev().find(".item:last-child").size() > 0) {
          $prevItem = $item.prev().find(".item:last-child").last();

        }else if($item.prev().size() > 0) {
          $prevItem = $item.prev();
        }else{
          $prevItem = $item.parents(".item").first();
        }

        $prevItem[0] && focus($prevItem.find(".title-wrap > .title"));

      }else if(ev.keyCode == 40){ //down
        ev.preventDefault();
        var $item = $(ev.target).parent().parent();
        var $nextItem;
        if($item.find(".tree .item:first-child").size() > 0) {
          $nextItem = $item.find(".tree .item:first-child")
        }else if($item.next().size() > 0) {
          $nextItem = $item.next();
        }else{
          $nextItem = $item.parents(".item").not(function(){
            return ($(this).next().size() == 0)
          }).first().next();
        }

        $nextItem[0] && focus($nextItem.find(".title-wrap > .title"));
      }else if(ev.keyCode == 8 && isCaretInFront()){ //delete
        console.log("delete")

      }else{
        var $item = $(ev.target).parent().parent();
        if($item.attr("status") !== "_created"){
          $item.attr("status", "_modified");
        }

      }
    });

    function focus(target){
      var rawTarget = target[0];
      window.getSelection().collapse(rawTarget, rawTarget.length);
    }

    function isCaretInFront(){
      sel = window.getSelection();
      return (sel.anchorOffset == 0 && sel.focusOffset == 0);
    }

    function hasChildren($item){
      return $item.find(".tree").size() > 0;
    }

    function newItemAfter(item){
      $(item).after(newItem());
    }
    function newItemBefore(item){
      $(item).before(newItem());
    }
    function newItemInside(tree){
      $(tree).prepend(newItem());
    }

    function newTree(){
      return '<ul class="tree _new"></ul>';
    }
    function newItem(){
      return '<li class="item" id="' + generateUUID() + '" status="_created">' +
        '<a class="icon" href="#">#</a>' +
        '<div class="title-wrap">' +
        '<span class="title" contenteditable>' +
        //'</span><span class="go">></span><span class="drag">+</span> ' +
        '</div>' +
        '<div class="commands"><a class="open">열기</a> | <a class="delete">삭제</a></div>' +
        '</li>';
    }

    function generateUUID() {
      var d = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
      });
      return uuid;
    }
  };

  var livelistSerializer = livelist.serializer = {
    treeToJson: function($tree){
      var list = [];
      $(" .item", $tree).map(function(index) {
        list.push(livelistSerializer.itemToJson($(this)));
      });
      return list;
    },
    itemToJson: function($item){
      return {
        uuid: $item.attr("id"),
        title: $("> .title-wrap .title", $item).text().trim(),
        status: $item.attr("status"),
        parents: (function(){
          var list = [];
          $item.parents(".item").map(function() {
            list.push($(this).attr("id"));
          });
          return list;
        })(),
        parent: (function(){
          var $parent = $item.parent().parent();
          return $parent.prop("tagName") === "LI" ? $parent.attr("id") : "__ROOT__"
        })(),
        prev: $item.prev().attr("id"),
        next: $item.next().attr("id"),
        children: (function(){
          var list = [];
          $("> .tree > .item", $item).map(function(index) {
            list.push($(this).attr("id"));
          });
          return list;
        })()
      };
    }
    /*,
    jsonToLive: function(json, className){
        className = className || "";
        var output = [];
        if(json.length > 0){
          output.push('<ul class="tree ' + className +'">');
          for(var i=0; i < json.length; i++){
            var child = json[i];
            output.push(livelistSerializer.jsonToItem(child));
          }
          output.push('</ul>');
        }
        return output.join("\n");

    },
    jsonToItem: function(json){
      return '' +
        '<li class="item" id="' + json.uuid + '" >' +
          '<div class="title-wrap">' +
            '<span class="title" contenteditable>' + json.title + '</span><span class="go">></span><span class="drag">+</span> ' +
          '</div>' +
          (json.children ? livelistSerializer.jsonToLive(json.children) : '') +
        '</li>';
    }*/
  };

  var livelistNestedSerializer = livelist.nestedSerializer = {
    treeToJson: function($tree){
      var list = [];
      $("> .item", $tree).map(function(index) {
        list.push(livelistNestedSerializer.itemToJson($(this)));
      });
      return list;
    },
    itemToJson: function($item){
      return {
        _id: $item.attr("id"),
        _s: $item.attr("state"),
        title: $("> .title-wrap .title", $item).text().trim(),
        status: $item.attr("status"),
        parent: $item.parent().parent().attr("id"),
        prev: $item.prev().attr("id"),
        next: $item.next().attr("id"),
        children: (function(){
          return $("> .tree > .item", $item).size() > 0 ? livelistNestedSerializer.treeToJson($("> .tree", $item)) : [];
        })()
      };
    },
    jsonToLive: function(json, className){
        className = className || "";
        var output = [];
        if(json.length > 0){
          output.push('<ul class="tree ' + className +'">');
          for(var i=0; i < json.length; i++){
            var child = json[i];
            output.push(livelistNestedSerializer.jsonToItem(child));
          }
          output.push('</ul>');
        }
        return output.join("\n");

    },
    jsonToItem: function(json){
      return '' +
        '<li class="item" id="' + json._id + '" >' +
          '<a class="icon" href="#">#</a>' +
          '<div class="title-wrap">' +
            '<span class="title" contenteditable>' + json.title + '</span>' +
            //'<span class="go">></span><span class="drag">+</span> ' +
          '</div>' +
          '<div class="commands"><a class="open">열기</a> | <a class="delete">삭제</a></div>' +
          (json.children ? livelistNestedSerializer.jsonToLive(json.children) : '') +
        '</li>';
    }
  };

  return livelist;
})
