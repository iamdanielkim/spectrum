define("spectrum/uploadHelper", [
  'jquery',
  'jquery.ui.widget',
  'toastr',
  'fileupload/jquery.iframe-transport',
  'fileupload/jquery.fileupload'
  ], function($,jqueryui, toastr){


  var uploadHelper = {
    bindFileUpload: function (editor) { // file upload
      $('#fileupload').fileupload({
        dataType: 'json',
        progress: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#progress .bar').css('width', progress + '%');
        },
        done: function (e, data) {
            var filename = data.files[0].name;
            toastr.success("Upload Complete :D");
            editor.splitLine();
            editor.splitLine();
            editor.navigateDown(1);
            editor.navigateLineStart();

            editor.insert("!["+ filename + "](/attachments/" + filename +")");
        }
      });
    }
  };

  return uploadHelper;

});
