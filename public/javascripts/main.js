require.config({
  baseUrl: "/javascripts",
  paths: {
    "jquery": "/jquery/dist/jquery.min",
    "jquery.ui.widget": "/jquery-ui/ui/jquery.ui.widget",
    "fileupload": "/blueimp-file-upload/js",
    "toastr": "/toastr/toastr",
    "gherkin": "gherkin",
    "ace/mode/gherkin-en": "gsh/ace/mode-gherkin-en",
    "showdown": "markdown/showdown",
    "sharejs": "webclient/share.uncompressed",
    "sharejs/ace": "webclient/ace"
}});

require([
  'jquery',
  "spectrum/pagetreeHelper",
  'spectrum/editorHelper',
  'spectrum/gnbHelper',
  ], function($, pagetreeHelper, EditorHelper) {

    $(document).ready(function() {
      pagetreeHelper.bindLivelist();

      var editorHelper = new EditorHelper(ace, docName);
      var editor = editorHelper.create();

      require(['spectrum/uploadHelper'], function(uploadHelper) {
        uploadHelper.bindFileUpload(editor);
      });
    });
});
