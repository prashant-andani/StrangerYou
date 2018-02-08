(function () {
  'use strict';
  const api_config = {
    app_id: '40832646',
    app_key: '781703e792834963cc0004afd656aee3'
  };

  let video = document.querySelector('video'),
    canvas, img;
  // document.getElementById('uploadInput').addEventListener('change', readURL);
  document.getElementById('recgBtn').addEventListener('click', takeSnapshot);
  document.getElementById('btnCameraAccess').addEventListener('click', accessCamera);
  //recognizeImage('assets/sample_text.png');
  /**
   *  Access to camera
   * 
   */
  function accessCamera() {
    if (navigator.mediaDevices) {
      // access the web cam
      navigator.mediaDevices.getUserMedia({
          video: true
        })
        // permission granted:
        .then(function (stream) {
          video.src = window.URL.createObjectURL(stream);
          document.getElementById('btnCameraAccess').style.display = "none";
          document.getElementById('recgBtn').style.display = "block";

        })
        // permission denied:
        .catch(function (error) {
          console.log(error);
          document.body.textContent = 'Could not access the camera. Error: ' + error.name;
        });
    }
  }

  /**
   * Take a still photo of a video
   */
  function takeSnapshot() {

    // use MediaDevices API
    // docs: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

    video.style.display = "inline";
    let context;
    let width = video.offsetWidth,
      height = video.offsetHeight;

    canvas = canvas || document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, width, height);

    recognizeImage(canvas.toDataURL('image/png'));
  }

  /**
   * Read upload image
   */
  function readURL() {
    if (this.files && this.files[0]) {
      let reader = new FileReader();
      reader.onload = function (e) {
        img = document.querySelector('img') || document.createElement('img');
        img.setAttribute('src', e.target.result);
        img.setAttribute('width', 500);
        recognizeImage(e.target.result);
      }
      reader.readAsDataURL(this.files[0]);
    }
  }
  /**
   * Recognize image src via tesseract
   * @param {image src} image 
   */
  function recognizeImage(image) {
    const url = 'https://api.kairos.com/recognize';
    fetch(url, {
        method: 'post',
        headers: {
          'app_id': api_config.app_id,
          'app_key': api_config.app_key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "image": image,
          "gallery_name": "MyGallery"
        })
      }).then(res => res.json())
      .then(res => {
        let data = 'No faces found.. Try again..';
        if (res.Errors && res.Errors.length > 0) {
          data = res.Errors[0]['Message'];
        } else {
          console.log(res.images[0].transaction.status);
          if (res.images[0].transaction.status == 'success') {
            data = `Hey ${res.images[0].transaction.subject_id}!! How are you !!`
          } else {
            data = 'Hey stranger, can we be friends ... ??';
          }
        }
        document.getElementById('result').innerHTML = data;
      });
  }
})();
