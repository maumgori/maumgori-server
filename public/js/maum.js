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

//프로필 배경 이미지 미리보기. file 속성은 ng-change 가 안되서 컨트롤러에 넣지 않고 일반 함수로 입력.
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
