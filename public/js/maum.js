//토스터 옵션. 사용법은 http://codeseven.github.io/toastr/demo.html 참고.
toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": true,
  "progressBar": false,
  "positionClass": "toast-top-right",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}

//프로필 배경 이미지 미리보기. file 속성은 ng-change 가 안되서.
var profileBgImgCrop = function(input) {
  //https://github.com/fengyuanchen/cropper 사용.
//  $('#profile_bg_img').attr('src', '/images/profile_background.jpg');
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
//      $('#profile_bg_img').attr('src', e.target.result);
      $('#profile_bg_img').attr('src', e.target.result);
      $('#profile_bg_img').cropper({
        aspectRatio: 2 / 1,
        crop: function(data) {
          // Output the result data for cropping image.
        }
      });
    }
    reader.readAsDataURL(input.files[0]);
    $('#profileBgModal').modal('show');
  }
};

function readBgImg(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
//      $('#profile_bg_img').attr('src', e.target.result);
      $('#profile_bg_img').attr('src', e.target.result);

      $('#profile_bg_img').cropper({
        aspectRatio: 5 / 2,
        crop: function(data) {
          // Output the result data for cropping image.
        }
      });
      /*
      //리사이즈를 위한 이미지 넓이 계산 및 위치 조정.
      $('#profile_bg_img').removeAttr("width");
      $('#profile_bg_img').removeAttr("height");
//      console.log("width : "+$('#profile_bg_img').width());
//      console.log("height : "+$('#profile_bg_img').height());
      var org_width = $('#profile_bg_img').width();
      var org_height = $('#profile_bg_img').height();

      $('#profile_bg_img_div').removeAttr("width");
      $('#profile_bg_img_div').removeAttr("height");
      var canvas_width = $('#profile_bg_img_div').width();
      var canvas_height = Math.round(canvas_width / 3);
      console.log("canvas_width : "+canvas_width);
      console.log("canvas_height : "+canvas_height);
      var resize_height = Math.round(org_height * (canvas_width / org_width));
      console.log("resize_height : "+resize_height);
      var dist = Math.round((resize_height-canvas_height)/2);
      console.log(dist);
//      console.log("img 1 : "+$('#profile_bg_img').attr('src'));
      // 이미지 실제 사이즈를 줄여주지는 않음. width 설정하고 top: -67px 이런 식으로 위치 조정만 해줌.
//      $('#profile_bg_img').resizeAndCrop( { width:560, height:240 } );

      $('#profile_bg_img_div').attr('style','background-position:center -'+dist+'px;width:560px;height:240px;background-size:560px;background-image:url('+$('#profile_bg_img').attr('src')+');');
      $('#profile_bg_img').attr('style','display:none;');

      */
    }
    reader.readAsDataURL(input.files[0]);
  }
}

function getProfileBgData(){
  var bgCanvas = $('#profile_bg_img').cropper('getCroppedCanvas');
  console.log(bgCanvas.toDataURL());
}
