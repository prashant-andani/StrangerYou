// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }
      
      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module;

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module() {
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({4:[function(require,module,exports) {
(function () {
  'use strict';
  /** Use you own api_id and api_key */
  const api_config = {
    app_id: '40832646',
    app_key: '781703e792834963cc0004afd656aee3'
  };

  let video = document.querySelector('video'),
    canvas, img;
  document.getElementById('recgBtn').addEventListener('click', takeSnapshot);
  document.getElementById('btnCameraAccess').addEventListener('click', accessCamera);
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
    img = canvas.toDataURL('image/png');
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
    let btnEl = document.getElementById('recgBtn');
    let resultEl = document.getElementById('result');
    resultEl.style.display = 'none';
    btnEl.innerText = 'Recognizing...';
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
        btnEl.innerText = 'Recognize Me';
        let data = 'No faces found.. Try again..';

        if (res.Errors && res.Errors.length > 0) {
          data = res.Errors[0]['Message'];
        } else {
          if (res.images[0].transaction.status == 'success') {
            data = `<i class="far fa-5x fa-smile"></i><br/>Hey ${res.images[0].transaction.subject_id}!! How are you !!`
            resultEl.innerHTML = data;
          } else {
            data = `<i class="far fa-5x fa-frown"></i><br/>Hey stranger, can we be friends ... ??
            <input type="text" id="userNameTxt" class="form-control" placeholder="Your name?"/> <button id="btnAddUser" class="btn btn-success btn-block">OK</button>`;
            resultEl.innerHTML = data;
            document.getElementById('btnAddUser').addEventListener('click', recogNewUser);
          }
        }
        resultEl.style.display = 'block';
      });
  }

  function recogNewUser() {
    //img from global
    const url = 'https://api.kairos.com/enroll'
    const userName = document.getElementById('userNameTxt').value;
    fetch(url, {
        method: 'post',
        headers: {
          'app_id': api_config.app_id,
          'app_key': api_config.app_key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'image': img,
          'gallery_name': 'MyGallery',
          'subject_id': userName
        })
      }).then(res => res.json())
      .then(res => {
        console.log(res);
        let resultEl = document.getElementById('result');
        resultEl.innerText = `Hey ${userName}! From now on i can recognize you!!`;
      });
  }
})();

},{}],0:[function(require,module,exports) {
var global = (1, eval)('this');
var OldModule = module.bundle.Module;
function Module() {
  OldModule.call(this);
  this.hot = {
    accept: function (fn) {
      this._acceptCallback = fn || function () {};
    },
    dispose: function (fn) {
      this._disposeCallback = fn;
    }
  };
}

module.bundle.Module = Module;

if (!module.bundle.parent && typeof WebSocket !== 'undefined') {
  var ws = new WebSocket('ws://localhost:60171/');
  ws.onmessage = function(event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.require, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.require, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        window.location.reload();
      }
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + 'data.error.stack');
    }
  };
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || (Array.isArray(dep) && dep[dep.length - 1] === id)) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  if (cached && cached.hot._disposeCallback) {
    cached.hot._disposeCallback();
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallback) {
    cached.hot._acceptCallback();
    return true;
  }

  return getParents(global.require, id).some(function (id) {
    return hmrAccept(global.require, id)
  });
}
},{}]},{},[0,4])