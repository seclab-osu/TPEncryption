document.addEventListener('DOMContentLoaded', function () {
    init();
    // gry demo
    document.getElementById('try').addEventListener('click', trydemo, false);
    // browse
    document.getElementById('browse').addEventListener('change', browse, false);
    // show
    document.getElementById('set').addEventListener('click', set, false);
    // encrypt
    document.getElementById('encrypt').addEventListener('click', encrypt, false);
    // decrypt
    document.getElementById('decrypt').addEventListener('click', decrypt, false);
});

var image_p, image_e, image_d;
var image_pt, image_et, image_dt;
var tpe_blocksize, tpe_iteration, tpe_key, tpe_file;
var tpe;
var demo;

var init = function() {
    // document.getElementById("set").disabled = true;
    document.getElementById("decrypt").disabled = true;
    document.getElementById("encrypt").disabled = true;
    document.getElementById("iterations").value = 10;
    document.getElementById("blocksize").value = 20;
    document.getElementById("abc").hidden = true;
    document.getElementById("key").value = "V7a6kjqDeQUBNAev118sjOp3fbv_RMsHorWHkzuDCsM";
    console.log("128 bit key hard-coded for demo!");
    console.log(key.value);

    image_p = document.getElementById("canvas-og");
    image_pt = document.getElementById("canvas-ogt");
    image_e = document.getElementById("canvas-en");
    image_et = document.getElementById("canvas-ent");
    image_d = document.getElementById("canvas-de");
    image_dt = document.getElementById("canvas-det");
    document.getElementById("ddemo").style.display = "none";
}

var trydemo = function () {
    document.getElementById("ddemo").style.display = "flex";
    document.getElementById("try").style.display = "none";
}

var browse = function () {
    console.log("+ browse");
    if (this.files && this.files[0]) {
        var FR = new FileReader();
        FR.onload = function (e) {
            var img = new Image();
            img.onload = function () {
                image_p = document.getElementById("canvas-og");
                image_p.width = img.width;
                image_p.height = img.height;
                image_p.getContext("2d").drawImage(img, 0, 0, image_p.width, image_p.height);
                image_pt = document.getElementById("canvas-ogt");
                image_pt.width = img.width;
                image_pt.height = img.height;
                image_e.width = img.width;
                image_e.height = img.height;
                image_et.width = img.width;
                image_et.height = img.height;
                image_d.width = img.width;
                image_d.height = img.height;
                image_dt.width = img.width;
                image_dt.height = img.height;
                console.log(img.width);
                console.log(img.height);
            };
            img.src = e.target.result;
        };
        FR.readAsDataURL(this.files[0]);
    }
    console.log("- browse");
}

var set = function(){
    console.log("+ set");
    tpe_iteration = document.getElementById("iterations").value;
    tpe_blocksize = document.getElementById("blocksize").value;
    tpe_key = document.getElementById("key").value;
    tpe_file = document.getElementById("browse").value

    if(tpe_blocksize == null || tpe_blocksize == "" ||
        tpe_blocksize == null || tpe_blocksize == "" ||
        tpe_file == null || tpe_file == "" ||
        tpe_key == null || tpe_key == ""){
            alert("Please set valid parameters!")
    }
    else{
        draw_thumbnail(image_p, image_pt)
        tpe = new TPEncryption(tpe_key, tpe_iteration, tpe_blocksize);
        document.getElementById("encrypt").disabled = false;
    }
}

var draw_thumbnail = function (icanvas, tcanvas) {
    console.log("+ draw_thumbnail");
    var blocksize = tpe_blocksize;
    var img_data = icanvas.getContext("2d").getImageData(0, 0, icanvas.width, icanvas.height);
    var data = img_data.data;
    tcanvas.width = icanvas.width;
    tcanvas.height = icanvas.height;

    var m = parseInt(Math.floor(icanvas.width / blocksize));
    var n = parseInt(Math.floor(icanvas.height / blocksize));

    var r, g, b, p, q;
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < m; j++) {
            r = 0;
            g = 0;
            b = 0;
            for (var k = 0; k < blocksize * blocksize; k += 1) {
                p = parseInt(k / blocksize);
                q = k % blocksize;
                r += data[(i * icanvas.width * blocksize + p * icanvas.width + j * blocksize + q) * 4];
                g += data[(i * icanvas.width * blocksize + p * icanvas.width + j * blocksize + q) * 4 + 1];
                b += data[(i * icanvas.width * blocksize + p * icanvas.width + j * blocksize + q) * 4 + 2];
            }
            for (var k = 0; k < blocksize * blocksize; k += 1) {
                p = parseInt(k / blocksize);
                q = k % blocksize;
                data[(i * icanvas.width * blocksize + p * icanvas.width + j * blocksize + q) * 4] = parseInt(r / (blocksize * blocksize));
                data[(i * icanvas.width * blocksize + p * icanvas.width + j * blocksize + q) * 4 + 1] = parseInt(g / (blocksize * blocksize));
                data[(i * icanvas.width * blocksize + p * icanvas.width + j * blocksize + q) * 4 + 2] = parseInt(b / (blocksize * blocksize));
            }
        }
    }
    var ctx = tcanvas.getContext("2d");
    ctx.putImageData(img_data, 0, 0);
    console.log("- draw_thumbnail");
};



var encrypt = function () {
    console.log("+ encrypt");
    var imgin = document.getElementById("canvas-og");
    var imgout = document.getElementById("canvas-en");

    tpe.encrypt(imgin, imgout, function (time) {
        image_e = document.getElementById("canvas-en");
        image_et = document.getElementById("canvas-ent");
        draw_thumbnail(image_e, image_et);
        document.getElementById("decrypt").disabled = false;
        console.log(time);
    });
}


var setUploadStatus = function (status) {
    var s = document.getElementById("upload_status");
    var msg = "Upload Status: " + status
    s.innerHTML = msg;
    console.log(msg)
}


var setUploadStat = function (stat) {
    var s = document.getElementById("upload_stat");
    s.innerHTML = stat;
    console.log("upload stat:" + stat)
}


var upload = function () {
    chrome.identity.getAuthToken({
        'interactive': true
    }, function (token) {
        var c = document.getElementById("canvas");
        setUploadStatus("uploading...");
        c.toBlob(function (blob) {
            sendImageBinary(token, blob)
        });
    });
}


var sendImageBinary = function (token, binaryData) {
    var time = new Date();
    var req = new XMLHttpRequest();
    req.open('POST', 'https://photoslibrary.googleapis.com/v1/uploads', true);
    req.setRequestHeader('Content-type', 'application/octet-stream');
    req.setRequestHeader('Authorization', 'Bearer ' + token);
    req.setRequestHeader('X-Goog-Upload-File-Name', time.toJSON());
    req.onreadystatechange = function () {
        var that = this;
        if (that.readyState === 4 && that.status === 200) {
            // ref https://developers.google.com/photos/library/guides/upload-media#uploading-bytes
            console.log("SUCCESS sendImageBinary");
            console.log(that.responseText);
            var uploadToken = this.response;
            setUploadStatus("Uploaded Image Binary");
            sendMediaItemRequest(token, uploadToken);
        } else {
            console.log("ERROR in sendImageBinary");
            setUploadStatus("Upload Failed at sendImageBinary");
        }
    };
    req.send(binaryData);
};


var sendMediaItemRequest = function (token, uploadToken) {
    var req = new XMLHttpRequest();
    req.open('POST', 'https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate', true);
    req.setRequestHeader('Content-type', 'application/json');
    req.setRequestHeader('Authorization', 'Bearer ' + token);
    var payload = {
        "newMediaItems": [{
            "description": "tpeimage",
            "simpleMediaItem": {
                "uploadToken": uploadToken
            }
        }]
    }
    payload = JSON.stringify(payload);
    req.onreadystatechange = function () {
        var that = this;
        if (that.readyState === 4 && that.status === 200) {
            // ref https://developers.google.com/photos/library/guides/upload-media#item-creation-response
            setUploadStatus("Upload Success");
            var response = JSON.parse(that.response);
            var url = response.newMediaItemResults[0].mediaItem.productUrl;
            setUploadStatus('<a href="' + url + '">Google Photos</a>');
        } else {
            setUploadStatus("Upload Failed at sendMediaItemRequest");
        }
    };
    req.send(payload);
};


var decrypt = function () {
    console.log("+ decrypt");
    var imgin = document.getElementById("canvas-en");
    var imgout = document.getElementById("canvas-de");

    tpe.decrypt(imgin, imgout, function (time) {
        image_d = document.getElementById("canvas-de");
        image_dt = document.getElementById("canvas-det");
        draw_thumbnail(image_d, image_dt);
        console.log(time);
    });
};

var setDownloadStatus = function (status) {
    var s = document.getElementById("download_status");
    var msg = "Download Status: " + status;
    s.innerHTML = msg;
    console.log(msg);
}


var setDownloadStat = function (stat) {
    var s = document.getElementById("download_stat");
    s.innerHTML = stat;
    console.log("download stat:" + stat);
}


var download = function () {
    var downloadLink = document.getElementById("dl_link");
    var x = document.getElementById("canvas_dl");
    var dt = x.toDataURL('image/png');
    downloadLink.href = dt;
    downloadLink.download = "download";
    setDownloadStatus("Downloading...")
    downloadLink.click();
    setDownloadStatus("Done!");
};


var TPEncryption = function (key, iterations, blocksize) {
    this.key = key;
    this.iterations = iterations;
    this.blocksize = blocksize;
};


TPEncryption.prototype.encrypt = function (image_in, image_out, callback) {
    var that = this
    this.image_p = image_in;
    this.image_e = image_out;
    this.image_e.width = image_in.width
    this.image_e.height = image_in.height

    var c = image_in;
    var ctx = that.image_p.getContext("2d");
    var ctx2 = that.image_e.getContext("2d");
    var block_size = that.blocksize;


    var m = parseInt(Math.floor(c.width / block_size)),
        n = parseInt(Math.floor(c.height / block_size));

    var permutation = [];
    var r1, g1, b1, r2, g2, b2, rt1, gt1, bt1, rt2, gt2, bt2, p, q, x, y;
    // substitute pixels!
    var imageData = ctx.getImageData(0, 0, c.width, c.height);
    var data = imageData.data;

    var totalRndForPermutation = that.iterations * n * m * block_size * block_size;
    var totalRndForSubstitution = that.iterations * n * m *
        parseInt((block_size * block_size - (block_size * block_size) % 2) / 2) * 3;

    var timeOfStart = new Date().getTime();
    var sAesRndNumGen = new AesRndNumGen(that.key, totalRndForSubstitution, function () {
        var pAesRndNumGen = new AesRndNumGen(that.key, totalRndForPermutation, function () {
            var timeOfEndOfAes = new Date().getTime();
            for (var ccc = 0; ccc < that.iterations; ccc += 1) {
                // substitution
                for (var i = 0; i < n; i += 1) {
                    for (var j = 0; j < m; j += 1) {
                        for (var k = 0; k < block_size * block_size - 1; k += 2) {
                            p = parseInt(k / block_size);
                            q = k % block_size;
                            x = parseInt((k + 1) / block_size);
                            y = (k + 1) % block_size;

                            r1 = data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4];
                            g1 = data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4 + 1];
                            b1 = data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4 + 2];

                            r2 = data[(i * c.width * block_size + x * c.width + j * block_size + y) * 4];
                            g2 = data[(i * c.width * block_size + x * c.width + j * block_size + y) * 4 + 1];
                            b2 = data[(i * c.width * block_size + x * c.width + j * block_size + y) * 4 + 2];

                            rt1 = sAesRndNumGen.getNewCouple(r1, r2, true);
                            rt2 = r1 + r2 - rt1;

                            gt1 = sAesRndNumGen.getNewCouple(g1, g2, true);
                            gt2 = g1 + g2 - gt1;

                            bt1 = sAesRndNumGen.getNewCouple(b1, b2, true);
                            bt2 = b1 + b2 - bt1;

                            data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4] = rt1;
                            data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4 + 1] = gt1;
                            data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4 + 2] = bt1;

                            data[(i * c.width * block_size + x * c.width + j * block_size + y) * 4] = rt2;
                            data[(i * c.width * block_size + x * c.width + j * block_size + y) * 4 + 1] = gt2;
                            data[(i * c.width * block_size + x * c.width + j * block_size + y) * 4 + 2] = bt2;
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
                            r = data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4];
                            g = data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4 + 1];
                            b = data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4 + 2];
                            r_list.push(r);
                            g_list.push(g);
                            b_list.push(b);
                        }

                        permutation = pAesRndNumGen.getNewPermutation(block_size);
                        //var sr = 0, sg= 0, sb=0;
                        for (var k = 0; k < block_size * block_size; k += 1) {
                            p = parseInt(k / block_size);
                            q = k % block_size;
                            data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4] = r_list[permutation[k]];
                            data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4 + 1] = g_list[permutation[k]];
                            data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4 + 2] = b_list[permutation[k]];
                        }
                    }
                }
            }
            var timeOfEnd = new Date().getTime();
            //console.log("done in " + (end - start) + " ms. number of rnd generated = " + (sAesRndNumGen.ctr + pAesRndNumGen.ctr));
            ctx2.putImageData(imageData, 0, 0);
            console.log("aes " + (timeOfEndOfAes - timeOfStart));
            console.log("after aes" + (timeOfEnd - timeOfEndOfAes));
            console.log("TPE encrypt FIN");
            callback(timeOfEnd - timeOfStart);
        });
    });

    // that.thumb();
};


TPEncryption.prototype.decrypt = function (image_in, image_out, callback) {
    var that = this;
    this.image_e = image_in;
    this.image_d = image_out;
    this.image_d.width = image_in.width
    this.image_d.height = image_in.height

    var c = image_in;
    var ctx = that.image_e.getContext("2d");
    var ctx2 = that.image_d.getContext("2d");
    var block_size = that.blocksize;

    var m = parseInt(Math.floor(c.width / block_size)),
        n = parseInt(Math.floor(c.height / block_size));

    var permutation = [];
    var r1, g1, b1, r2, g2, b2, rt1, gt1, bt1, rt2, gt2, bt2, p, q, x, y;
    // substitute pixels!
    var imageData = ctx.getImageData(0, 0, c.width, c.height);
    var data = imageData.data;


    var totalRndForPermutation = that.iterations * n * m * block_size * block_size;
    var totalRndForSubstitution = that.iterations * n * m *
        parseInt((block_size * block_size - (block_size * block_size) % 2) / 2) * 3;

    var sAesRndNumGen = new AesRndNumGen(that.key, totalRndForSubstitution, function () {
        var pAesRndNumGen = new AesRndNumGen(that.key, totalRndForPermutation, function () {
            pAesRndNumGen.ctr = totalRndForPermutation;
            sAesRndNumGen.ctr = totalRndForSubstitution;

            var start = new Date().getTime();
            for (var ccc = 0; ccc < that.iterations; ccc += 1) {

                sAesRndNumGen.ctr = (that.iterations - (ccc + 1)) * (totalRndForSubstitution / that.iterations);
                pAesRndNumGen.ctr = (that.iterations - (ccc + 1)) * (totalRndForPermutation / that.iterations);

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
                            r = data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4];
                            g = data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4 + 1];
                            b = data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4 + 2];
                            r_list.push(r);
                            g_list.push(g);
                            b_list.push(b);
                        }
                        permutation = pAesRndNumGen.getNewPermutation(block_size);

                        //var sr = 0, sg= 0, sb=0;
                        for (var k = 0; k < block_size * block_size; k += 1) {
                            p = parseInt(permutation[k] / block_size);
                            q = permutation[k] % block_size;
                            data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4] = r_list[k];
                            data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4 + 1] = g_list[k];
                            data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4 + 2] = b_list[k];
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

                            r1 = data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4];
                            g1 = data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4 + 1];
                            b1 = data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4 + 2];

                            r2 = data[(i * c.width * block_size + x * c.width + j * block_size + y) * 4];
                            g2 = data[(i * c.width * block_size + x * c.width + j * block_size + y) * 4 + 1];
                            b2 = data[(i * c.width * block_size + x * c.width + j * block_size + y) * 4 + 2];

                            rt1 = sAesRndNumGen.getNewCouple(r1, r2, false);
                            rt2 = r1 + r2 - rt1;

                            gt1 = sAesRndNumGen.getNewCouple(g1, g2, false);
                            gt2 = g1 + g2 - gt1;

                            bt1 = sAesRndNumGen.getNewCouple(b1, b2, false);
                            bt2 = b1 + b2 - bt1;

                            data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4] = rt1;
                            data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4 + 1] = gt1;
                            data[(i * c.width * block_size + p * c.width + j * block_size + q) * 4 + 2] = bt1;

                            data[(i * c.width * block_size + x * c.width + j * block_size + y) * 4] = rt2;
                            data[(i * c.width * block_size + x * c.width + j * block_size + y) * 4 + 1] = gt2;
                            data[(i * c.width * block_size + x * c.width + j * block_size + y) * 4 + 2] = bt2;
                        }
                    }
                }
            }
            var end = new Date().getTime();
            //console.log("done in " + (end - start) + " ms. number of rnd generated = " + (sAesRndNumGen.ctr + pAesRndNumGen.ctr));
            ctx2.putImageData(imageData, 0, 0);
            console.log("TPE decrypt FIN");
            callback(end - start);
        });
    });

};


var AesRndNumGen = function (key, totalNeed, callback) {
    var that = this;
    that.ctr = 0;
    that.data = [];
    if (!key) {
        console.error("key not set!");
    } else {
        window.crypto.subtle.importKey(
            "jwk", //can be "jwk" or "raw"
            { //this is an example jwk key, "raw" would be an ArrayBuffer
                kty: "oct",
                k: key,
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
            window.crypto.subtle.encrypt(
                {
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
                console.log("AES init FIN");
                callback();
            })
            .catch(function (err) {
                console.error(err.message);
            });
        })
        .catch(function (err) {
            console.error(err.message);
        });
    }
};

AesRndNumGen.prototype.next = function () {
    // console.log("AES next");
    var that = this;
    that.ctr += 1;
    return that.data[that.ctr - 1];
};

AesRndNumGen.prototype.getNewCouple = function (p, q, enc) {
    // console.log("AES getNewCouple");
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

AesRndNumGen.prototype.getNewPermutation = function (block_size) {
    // console.log("AES getNewPermutation");
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
