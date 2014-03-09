

window.livelistSerializer = {
  treeToJson: function($tree){
    var list = [];
    $("> .item", $tree).map(function(index) {
      list.push(livelistSerializer.itemToJson($(this)));
    });
    return list;
  },
  itemToJson: function($item){
    return {
      uuid: $item.attr("id"),
      title: $("> .title-wrap .title", $item).text(),
      parent: $item.parent().parent().attr("id"),
      status: $item.attr("status"),
      children: (function(){
        return $("> .tree > .item", $item).size() > 0 ? livelistSerializer.treeToJson($("> .tree", $item)) : [];
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
  }
};
