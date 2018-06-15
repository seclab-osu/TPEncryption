var get_google_auth_token = function (fn) {
    chrome.identity.getAuthToken({ 'interactive': true }, function (token) {
        fn(token);
    });
};

function changeTab(evt, cityName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(cityName).style.display = "block";
    //evt.currentTarget.className += " active";
}

function changeTab1() {
    changeTab(this, "AUTH");
    document.getElementById("AUTH_LINK").className += " active";
    var displayAuthStatus = function(token) {
        if(token)
            document.getElementById("auth_status").innerHTML = "Staus: Logged in";
        else
            document.getElementById("auth_status").innerHTML = "Staus: Error Authenticating";
    }
    get_google_auth_token(displayAuthStatus);
}

function changeTab2() {
    changeTab(this, "UPLOAD");
    document.getElementById("UPLOAD_LINK").className += " active";
}

function changeTab3() {
    changeTab(this, "DOWNLOAD");
    document.getElementById("DOWNLOAD_LINK").className += " active";
}

var div, div2;

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('browse').addEventListener('change', browse, false);
    // document.getElementById('downloadable_images').addEventListener('change', change_downloadable_images, false);
    document.getElementById('encrypt').addEventListener('click', encrypt, false);
    document.getElementById('decrypt').addEventListener('click', decrypt, false);
    document.getElementById('upload').addEventListener('click', upload, false);
    document.getElementById('downloadLink').addEventListener('click', download, false);
    document.getElementById('AUTH_LINK').addEventListener('click', changeTab1, false);
    document.getElementById('UPLOAD_LINK').addEventListener('click', changeTab2, false);
    document.getElementById('DOWNLOAD_LINK').addEventListener('click', changeTab3, false);
});


var download = function () {
    var downloadLink = document.getElementById("downloadLink");
    var x = document.getElementById("canvas_dl");
    var dt = x.toDataURL('image/png');
    downloadLink.href = dt;
    downloadLink.download = "download";
    console.log("downloaded?");
};

function encrypt() {
    setUploadStatus("Encrypting");
    var e = document.getElementById('block-size');
    var size = e.value;
    if (!size)
        size = 25;
    else
        size = parseInt(size);
    var e = document.getElementById('iter');
    var iter = e.value;
    if (!iter)
        iter = 100;
    else
        iter = parseInt(iter);
    setTimeout(function () {
        var x = new TPEncryption(div, "Example128BitKey");
        x.encrypt(iter, size, function (time) {
            setUploadStatus("Encrypted in: " + time + "ms");
        });
    }, 100);
}

function draw(){
    var img = new Image();
    img.onload = function () {
        div = document.getElementById("canvas_dl");
        div.width = img.width;
        div.height = img.height;
        div.getContext("2d").drawImage(img, 0, 0, div.width, div.height);
    };
    img.src = document.getElementById("img_url").value;
}

function decrypt() {
    draw()
    var d = document.getElementById("status2");
    d.innerHTML = "running ...";
    var e = document.getElementById('block-size2');
    var size = e.value;
    if (!size)
        size = 25;
    else
        size = parseInt(size);
    var e = document.getElementById('iter2');
    var iter = e.value;
    if (!iter)
        iter = 1;
    else
        iter = parseInt(iter);
    setTimeout(function () {
        var x = new TPEncryption(div, "Example128BitKey");
        x.decrypt(iter, size, function (time) {
            d.innerHTML = "rune-time: " + (time) + " ms";
        });
    }, 100);
};

var get_binary_data_from_canvas = function(canvas) {
    var canvas = canvas;
    return canvas.toDataURL();
}

var returnToken = function(token){
    return token;
}

var sendMediaItemRequest = function(uploadToken){
    var req = new XMLHttpRequest();
    req.open('POST', 'https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate', true);
    req.setRequestHeader('Content-type', 'application/json');
    req.setRequestHeader('Authorization', 'Bearer ' + get_google_auth_token(returnToken));
    var payload = {
        "newMediaItems": [
            {
                "description": "tpeimage",
                "simpleMediaItem": {
                    "uploadToken": uploadToken
                }
            }
        ]
    }
    payload = JSON.stringify(payload);
    req.onreadystatechange = function(){
        var that = this;
        if (that.readyState === 4 && that.status === 200) {
            // ref https://developers.google.com/photos/library/guides/upload-media#item-creation-response
            console.log("SUCCESS sendMediaItemRequest");
            setUploadStatus("Upload Success");
        } else {
            console.log("ERROR in sendMediaItemRequest");
            setUploadStatus("Upload Failed at sendMediaItemRequest");
        }
    };
    req.send(payload);
};

var sendImageBinary = function(binaryData){
    var time = new Date();
    var req = new XMLHttpRequest();
    req.open('POST', 'https://photoslibrary.googleapis.com/v1/uploads', true);
    req.setRequestHeader('Content-type', 'application/octet-stream');
    req.setRequestHeader('Authorization', 'Bearer ' + get_google_auth_token(returnToken));
    req.setRequestHeader('X-Goog-Upload-File-Name', time.toJSON());
    req.onreadystatechange = function(){
        var that = this;
        if (that.readyState === 4 && that.status === 200) {
            // ref https://developers.google.com/photos/library/guides/upload-media#uploading-bytes
            console.log("SUCCESS sendImageBinary");
            console.log(that.responseText);
            var uploadToken = this.response;
            setUploadStatus("Uploaded Image Binary");
            sendMediaItemRequest(uploadToken);
        }
        else {
            console.log("ERROR in sendImageBinary");
            setUploadStatus("Upload Failed at sendImageBinary");
        }
    };
    req.send(binaryData);
};

var setUploadStatus = function(status){
    var s = document.getElementById("upload_status");
    s.innerHTML = "Upload Status: " + status;
}

var upload = function() {
    var binaryData = get_binary_data_from_canvas(document.getElementById("canvas"));
    setUploadStatus("uploading...");
    sendImageBinary(binaryData)
}

function browse() {
    if (this.files && this.files[0]) {
        var FR = new FileReader();
        FR.onload = function (e) {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function (tabs) {
                var img = new Image();
                img.onload = function () {
                    div = document.getElementById("canvas");
                    div.width = img.width;
                    div.height = img.height;
                    div.getContext("2d").drawImage(img, 0, 0, div.width, div.height);
                    div2 = document.getElementById("canvas_thumb");
                    div2.width = img.width;
                    div2.height = img.height;
                    div2.getContext("2d").drawImage(img, 0, 0, div2.width, div2.height);
                    console.log(img.width);
                    console.log(img.height);
                };
                img.src = e.target.result;

            });
        };
        FR.readAsDataURL(this.files[0]);
    }
}

var change_downloadable_images = function () {
    console.log("***** in popup.js change_downloadable_images");
    var d = document.getElementById("downloadable_images");
    var strUser = d.options[d.selectedIndex].value;
    console.log(strUser);

    var img = new Image();
    img.onload = function () {
        div = document.getElementById("canvas_dl");
        div.width = img.width;
        div.height = img.height;
        div.getContext("2d").drawImage(img, 0, 0, div.width, div.height);
        console.log(img.width);
        console.log(img.height);
    };
    img.src = strUser;
};

// TPE Stuff

var TPEncryption = function TPEncryption(canvasId, key) {
    console.log("***** in popup.js TPEncryption");
    var that = this;
    that.mat_r = [];
    that.mat_g = [];
    that.mat_b = [];

    that.canvasId = canvasId;
    that.key = undefined;

    var c = canvasId;
    that.c = c;
    that.w = c.width;
    that.h = c.height;
    that.block_size = 0;

    var ctx = c.getContext("2d");
    that.canvasImgData = ctx.getImageData(0, 0, that.w, that.h);
};


TPEncryption.prototype.thumb = function () {
    console.log("***** in popup.js TPEncryption thumb");
    var that = this;
    var block_size = that.block_size;
    var c = that.c;
    var ctx = c.getContext("2d");
    var imageData = that.canvasImgData;
    var data = imageData.data;
    var m = parseInt(Math.floor(that.w / block_size)),
        n = parseInt(Math.floor(that.h / block_size));
    var r, g, b, p, g, p, q;
    for (var i = 0; i < n; i += 1) {
        for (var j = 0; j < m; j += 1) {
            r = 0;
            g = 0;
            b = 0;
            for (var k = 0; k < block_size * block_size; k += 1) {
                p = parseInt(k / block_size);
                q = k % block_size;
                r += data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4];
                g += data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1];
                b += data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2];
            }
            for (var k = 0; k < block_size * block_size; k += 1) {
                p = parseInt(k / block_size);
                q = k % block_size;
                data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4] = parseInt(r / (block_size * block_size));
                data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1] = parseInt(g / (block_size * block_size));
                data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2] = parseInt(b / (block_size * block_size));
            }
        }
    }
    var ctx2 = document.getElementById("canvas_thumb").getContext("2d");
    ctx2.putImageData(imageData, 0, 0);
};


TPEncryption.prototype.encrypt = function (num_of_iter, block_size, callback) {
    console.log("***** in popup.js TPEncryption encrypt");
    var that = this;
    that.block_size = block_size;

    var c = that.c;
    var ctx = c.getContext("2d");

    var m = parseInt(Math.floor(that.w / block_size)),
        n = parseInt(Math.floor(that.h / block_size));

    var permutation = [];
    var r1, g1, b1, r2, g2, b2, rt1, gt1, bt1, rt2, gt2, bt2, p, q, x, y;
    // substitute pixels!
    var imageData = ctx.getImageData(0, 0, that.w, that.h);
    var data = imageData.data;

    var totalRndForPermutation = num_of_iter * n * m * block_size * block_size;
    var totalRndForSubstitution = num_of_iter * n * m *
        parseInt((block_size * block_size - (block_size * block_size) % 2) / 2) * 3;

    var timeOfStart = new Date().getTime();
    var sAesRndNumGen = new AesRndNumGen(that.key, totalRndForSubstitution, function () {
        var pAesRndNumGen = new AesRndNumGen(that.key, totalRndForPermutation, function () {
            var timeOfEndOfAes = new Date().getTime();
            for (var ccc = 0; ccc < num_of_iter; ccc += 1) {
                // substitution
                for (var i = 0; i < n; i += 1) {
                    for (var j = 0; j < m; j += 1) {
                        for (var k = 0; k < block_size * block_size - 1; k += 2) {
                            p = parseInt(k / block_size);
                            q = k % block_size;
                            x = parseInt((k + 1) / block_size);
                            y = (k + 1) % block_size;

                            r1 = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4];
                            g1 = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1];
                            b1 = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2];

                            r2 = data[(i * that.w * block_size + x * that.w + j * block_size + y) * 4];
                            g2 = data[(i * that.w * block_size + x * that.w + j * block_size + y) * 4 + 1];
                            b2 = data[(i * that.w * block_size + x * that.w + j * block_size + y) * 4 + 2];

                            rt1 = sAesRndNumGen.getNewCouple(r1, r2, true);
                            rt2 = r1 + r2 - rt1;

                            gt1 = sAesRndNumGen.getNewCouple(g1, g2, true);
                            gt2 = g1 + g2 - gt1;

                            bt1 = sAesRndNumGen.getNewCouple(b1, b2, true);
                            bt2 = b1 + b2 - bt1;

                            data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4] = rt1;
                            data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1] = gt1;
                            data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2] = bt1;

                            data[(i * that.w * block_size + x * that.w + j * block_size + y) * 4] = rt2;
                            data[(i * that.w * block_size + x * that.w + j * block_size + y) * 4 + 1] = gt2;
                            data[(i * that.w * block_size + x * that.w + j * block_size + y) * 4 + 2] = bt2;
                        }
                    }
                }
                //// permutation
                var r, g, b, r_list, g_list, b_list;
                for (var i = 0; i < n; i += 1) {
                    for (var j = 0; j < m; j += 1) {
                        r_list = [];
                        g_list = [];
                        b_list = [];
                        for (var k = 0; k < block_size * block_size; k += 1) {
                            p = parseInt(k / block_size);
                            q = k % block_size;
                            r = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4];
                            g = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1];
                            b = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2];
                            r_list.push(r);
                            g_list.push(g);
                            b_list.push(b);
                        }

                        permutation = pAesRndNumGen.getNewPermutation(block_size);
                        //var sr = 0, sg= 0, sb=0;
                        for (var k = 0; k < block_size * block_size; k += 1) {
                            p = parseInt(k / block_size);
                            q = k % block_size;
                            data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4] = r_list[permutation[k]];
                            data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1] = g_list[permutation[k]];
                            data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2] = b_list[permutation[k]];
                        }
                    }
                }
            }
            var timeOfEnd = new Date().getTime();
            //console.log("done in " + (end - start) + " ms. number of rnd generated = " + (sAesRndNumGen.ctr + pAesRndNumGen.ctr));
            ctx.putImageData(imageData, 0, 0);
            console.log("aes " + (timeOfEndOfAes - timeOfStart));
            console.log("after aes" + (timeOfEnd - timeOfEndOfAes));
            callback(timeOfEnd - timeOfStart);
        });
    });

    that.thumb();
};


TPEncryption.prototype.decrypt = function (num_of_iter, block_size, callback) {
    console.log("***** in popup.js TPEncryption decrypt");
    var that = this;
    that.block_size = block_size;

    var c = that.c;
    var ctx = c.getContext("2d");

    var m = parseInt(Math.floor(that.w / block_size)),
        n = parseInt(Math.floor(that.h / block_size));

    var permutation = [];
    var r1, g1, b1, r2, g2, b2, rt1, gt1, bt1, rt2, gt2, bt2, p, q, x, y;
    // substitute pixels!
    var imageData = ctx.getImageData(0, 0, that.w, that.h);
    var data = imageData.data;


    var totalRndForPermutation = num_of_iter * n * m * block_size * block_size;
    var totalRndForSubstitution = num_of_iter * n * m *
        parseInt((block_size * block_size - (block_size * block_size) % 2) / 2) * 3;

    var sAesRndNumGen = new AesRndNumGen(that.key, totalRndForSubstitution, function () {
        var pAesRndNumGen = new AesRndNumGen(that.key, totalRndForPermutation, function () {
            pAesRndNumGen.ctr = totalRndForPermutation;
            sAesRndNumGen.ctr = totalRndForSubstitution;

            var start = new Date().getTime();
            for (var ccc = 0; ccc < num_of_iter; ccc += 1) {

                sAesRndNumGen.ctr = (num_of_iter - (ccc + 1)) * (totalRndForSubstitution / num_of_iter);
                pAesRndNumGen.ctr = (num_of_iter - (ccc + 1)) * (totalRndForPermutation / num_of_iter);

                console.log(sAesRndNumGen.ctr);

                // permutation reverse
                var r, g, b, r_list, g_list, b_list;
                for (var i = 0; i < n; i += 1) {
                    for (var j = 0; j < m; j += 1) {
                        r_list = [];
                        g_list = [];
                        b_list = [];
                        for (var k = 0; k < block_size * block_size; k += 1) {
                            p = parseInt(k / block_size);
                            q = k % block_size;
                            r = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4];
                            g = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1];
                            b = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2];
                            r_list.push(r);
                            g_list.push(g);
                            b_list.push(b);
                        }
                        permutation = pAesRndNumGen.getNewPermutation(block_size);

                        //var sr = 0, sg= 0, sb=0;
                        for (var k = 0; k < block_size * block_size; k += 1) {
                            p = parseInt(permutation[k] / block_size);
                            q = permutation[k] % block_size;
                            data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4] = r_list[k];
                            data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1] = g_list[k];
                            data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2] = b_list[k];
                        }
                    }
                }
                // substitution reverse
                for (var i = 0; i < n; i += 1) {
                    for (var j = 0; j < m; j += 1) {
                        for (var k = 0; k < block_size * block_size - 1; k += 2) {
                            p = parseInt(k / block_size);
                            q = k % block_size;
                            x = parseInt((k + 1) / block_size);
                            y = (k + 1) % block_size;

                            r1 = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4];
                            g1 = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1];
                            b1 = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2];

                            r2 = data[(i * that.w * block_size + x * that.w + j * block_size + y) * 4];
                            g2 = data[(i * that.w * block_size + x * that.w + j * block_size + y) * 4 + 1];
                            b2 = data[(i * that.w * block_size + x * that.w + j * block_size + y) * 4 + 2];

                            rt1 = sAesRndNumGen.getNewCouple(r1, r2, false);
                            rt2 = r1 + r2 - rt1;

                            gt1 = sAesRndNumGen.getNewCouple(g1, g2, false);
                            gt2 = g1 + g2 - gt1;

                            bt1 = sAesRndNumGen.getNewCouple(b1, b2, false);
                            bt2 = b1 + b2 - bt1;

                            data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4] = rt1;
                            data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1] = gt1;
                            data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2] = bt1;

                            data[(i * that.w * block_size + x * that.w + j * block_size + y) * 4] = rt2;
                            data[(i * that.w * block_size + x * that.w + j * block_size + y) * 4 + 1] = gt2;
                            data[(i * that.w * block_size + x * that.w + j * block_size + y) * 4 + 2] = bt2;
                        }
                    }
                }
            }
            var end = new Date().getTime();
            //console.log("done in " + (end - start) + " ms. number of rnd generated = " + (sAesRndNumGen.ctr + pAesRndNumGen.ctr));
            ctx.putImageData(imageData, 0, 0);
            callback(end - start);
        });
    });

};


var AesRndNumGen = function AesRndNumGen(key, totalNeed, callback) {
    console.log("***** in popup.js AesRndNumGen");
    var that = this;
    that.ctr = 0;
    that.data = [];

    chrome.storage.sync.get(['tp_secret_key'], function (key) {
        if (!key || !key.tp_secret_key) {
            window.crypto.subtle.generateKey({
                        name: "AES-CTR",
                        length: 256, //can be  128, 192, or 256
                    },
                    true, //whether the key is extractable (i.e. can be used in exportKey)
                    ["encrypt", "decrypt"] //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
                )
                .then(function (key) {
                    window.crypto.subtle.exportKey(
                            "jwk", //can be "jwk" or "raw"
                            key //extractable must be true
                        )
                        .then(function (keydata) {
                            //localStorage.setItem("tp_secret_key", keydata.k);

                            chrome.storage.sync.set({
                                'tp_secret_key': keydata.k
                            }, function () {
                                var k2 = keydata.k;

                                window.crypto.subtle.importKey(
                                        "jwk", //can be "jwk" or "raw"
                                        { //this is an example jwk key, "raw" would be an ArrayBuffer
                                            kty: "oct",
                                            k: k2,
                                            alg: "A256CTR",
                                            ext: true
                                        }, { //this is the algorithm options
                                            name: "AES-CTR"
                                        },
                                        false, //whether the key is extractable (i.e. can be used in exportKey)
                                        ["encrypt", "decrypt"] //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
                                    )
                                    .then(function (key) {
                                        //returns the symmetric key
                                        window.crypto.subtle.encrypt({
                                                    name: "AES-CTR",
                                                    //Don't re-use counters!
                                                    //Always use a new counter every time your encrypt!
                                                    counter: new Uint8Array(16),
                                                    length: 128 //can be 1-128
                                                },
                                                key, //from generateKey or importKey above
                                                new Uint8Array(totalNeed) //ArrayBuffer of data you want to encrypt
                                            )
                                            .then(function (encrypted) {
                                                that.data = new Uint8Array(encrypted);
                                                callback();
                                            })
                                            .catch(function (err) {
                                                console.error(err);
                                            });
                                    })
                                    .catch(function (err) {
                                        console.error(err);
                                    });
                            });

                        })
                        .catch(function (err) {
                            console.error(err);
                        });


                    console.log(key);
                })
                .catch(function (err) {
                    console.error(err);
                });
        } else {
            //console.log(key.tp_secret_key);
            window.crypto.subtle.importKey(
                    "jwk", //can be "jwk" or "raw"
                    { //this is an example jwk key, "raw" would be an ArrayBuffer
                        kty: "oct",
                        k: key.tp_secret_key,
                        alg: "A256CTR",
                        ext: true
                    }, { //this is the algorithm options
                        name: "AES-CTR"
                    },
                    false, //whether the key is extractable (i.e. can be used in exportKey)
                    ["encrypt", "decrypt"] //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
                )
                .then(function (key) {
                    //returns the symmetric key
                    window.crypto.subtle.encrypt({
                                name: "AES-CTR",
                                //Don't re-use counters!
                                //Always use a new counter every time your encrypt!
                                counter: new Uint8Array(16),
                                length: 128 //can be 1-128
                            },
                            key, //from generateKey or importKey above
                            new Uint8Array(totalNeed) //ArrayBuffer of data you want to encrypt
                        )
                        .then(function (encrypted) {
                            that.data = new Uint8Array(encrypted);
                            callback();
                        })
                        .catch(function (err) {
                            console.error(err);
                        });
                })
                .catch(function (err) {
                    console.error(err);
                });
        }
    });
};

AesRndNumGen.prototype.next = function next() {
    // console.log("***** in popup.js AesRndNumGen next");
    var that = this;
    that.ctr += 1;
    return that.data[that.ctr - 1];
};

AesRndNumGen.prototype.getNewCouple = function getNewCouple(p, q, enc) {
    // console.log("***** in popup.js AesRndNumGen getNewCouple");
    var that = this;
    var rnd = that.next();
    var sum = p + q;
    if (sum <= 255) {
        if (enc)
            rnd = (p + rnd) % (sum + 1);
        else
            rnd = (p - rnd) % (sum + 1);
        if (rnd < 0) rnd = rnd + sum + 1;
        return rnd;
    } else {
        // (0 + 200) % 111 = 89
        // (0 + 89  ) % 111 = 200
        if (enc) {
            rnd = 255 - (p + rnd) % (511 - sum);
            return rnd;
        } else {
            rnd = (255 - p - rnd) % (511 - sum);
            while (rnd < (sum - 255)) {
                rnd += 511 - sum;
            }
            return rnd;
        }
    }
};

AesRndNumGen.prototype.getNewPermutation = function getNewPermutation(block_size) {
    // console.log("***** in popup.js AesRndNumGen getNewPermutation");
    var that = this;
    var permutation = [];
    for (var z = 0; z < block_size * block_size; z += 1) {
        permutation.push(that.next());
    }
    var len = block_size * block_size;
    var indices = new Array(len);
    for (var i = 0; i < len; ++i) indices[i] = i;
    indices.sort(function (a, b) {
        return permutation[a] < permutation[b] ? -1 : permutation[a] > permutation[b] ? 1 : 0;
    });
    return indices;
};


changeTab1();
