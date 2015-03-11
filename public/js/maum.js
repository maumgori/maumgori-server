//이미지 파일 업로드. Ajax 이용.
function upload_photo(){
  var form = document.getElementsByName('user_photo_frm')[0];
  var formData = new FormData(form);
  $.ajax({
     url: '/fileupload/photo',
     processData: false,
     contentType: false,
     data: formData,
     type: 'POST',
     success: function(result){
       console.log("result: "+result);
       $('#user_photo').attr('ng-src',result);
     },
     error:function(e){
      console.log(e.responseText);
    }
  });
}
