/* Listen for messages */
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    /* If the received message has the expected format... */

    if (msg.text) {
        /* Call the specified callback, passing
         the web-pages DOM content as argument */
        console.log("salam");

        if (msg.text == "report_back") {
            sendResponse(getElementsByAttributeName('img', 'src', msg.imgSrc));
        } else {
            console.log(msg.text);
            console.log(msg.subject);

            var img = new Image();
            img.onload = function(){
                var div = document.createElement("canvas");
                div.innerHTML = "Hello";
                div.style.position = "absolute";
                div.style.top = getOffset(img).top + "px";
                div.style.left = getOffset(img).left + "px";
                div.width = 300;
                div.height = 300;
                //div.getContext("2d").clearRect(0, 0, img.width, img.height);
                div.getContext("2d").drawImage(img, 0, 0, div.width, div.height);
                div.id = "khar11";
                div.style.zIndex = "9999999999";

                sendResponse({"created_canvas": div, "majid": "khar"});

                //var kimilia = new KiMiLia(div);
                //kimilia.encrypt(1, 25);

            };
            img.src = msg.subject;



        }
    }

    return true;
});

var imgX;

function CreateDiv(img, top, left, width, height){
    imgX = img;

    console.log("Created");

    local_url_to_data_url(img.src, img.width, img.height, function(dataUri){

        img.onload = function(){
            var div = document.createElement("canvas");
            div.innerHTML = "Hello";
            div.style.position = "absolute";
            div.style.top = getOffset(img).top + "px";
            div.style.left = getOffset(img).left + "px";
            div.width = img.width;
            div.height = img.height;
            //div.getContext("2d").clearRect(0, 0, img.width, img.height);
            div.getContext("2d").drawImage(img, 0, 0, div.width, div.height);
            div.id = "khar11";
            div.style.zIndex = "9999999999";
            document.body.appendChild(div);

            var kimilia = new KiMiLia(div);
            kimilia.encrypt(1, 25);

        };
        img.src = dataUri;


    });

}

function local_url_to_data_url(url, w, h, success) {
    chrome.runtime.sendMessage(
        {message: "convert_image_url_to_data_url", url: url, w:w, h:h},
        function(response) {success(response.data)}
    );
}


function getElementsByAttributeName(tagName, attributeName, attributeValue) {
    var i, n, objs=[], els=document.getElementsByTagName(tagName), len=els.length;
    for (i=0; i<len; i++) {
        n = els[i][attributeName];
        if (n && (n==attributeValue)) {
            return CreateDiv(els[i]);
        }
    }
    return objs;
}

function getOffset(el) {
    el = el.getBoundingClientRect();
    return {
        left: el.left + window.scrollX,
        top: el.top + window.scrollY
    }
}


function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

var KiMiLia = function KiMiLia(canvasId) {
    var that = this;
    that.mat_r = [];
    that.mat_g = [];
    that.mat_b = [];

    that.canvasId = canvasId;


    var c = canvasId;
    that.c = c;
    that.w = c.width;
    that.h = c.height;

    var ctx = c.getContext("2d");
    that.canvasImgData = ctx.getImageData(0, 0, that.w, that.h);

    //that.thumb(5);
};

KiMiLia.prototype.convertCanvasToMat = function() {
    var that = this;
    that.mat_r = [];
    that.mat_g = [];
    that.mat_b = [];

    var data = that.canvasImgData.data;

    for (var i=0; i<that.h; i+=1) {
        that.mat_r.push(new Array(that.w).fill(null));
        that.mat_g.push(new Array(that.w).fill(null));
        that.mat_b.push(new Array(that.w).fill(null));
        for (var j=0; j<that.w; j+=1) {
            that.mat_r[i][j] = data[((i * that.w + j) << 2)];
            that.mat_g[i][j] = data[((i * that.w + j) << 2) + 1];
            that.mat_b[i][j] = data[((i * that.w + j) << 2) + 2];
        }
    }
};

KiMiLia.prototype.thumb = function(block_size) {
    var that = this;

    var c = document.getElementById(that.canvasId);
    var ctx = c.getContext("2d");
    var imageData = ctx.getImageData(0, 0, 500, 500);
    var data = imageData.data;
    var m = that.w / block_size, n = that.h / block_size;
    var r, g, b;
    for (var i=0; i<n; i+=1) {
        for (var j = 0; j < m; j += 1) {
            r = 0;
            g = 0;
            b = 0;
            for (var k = 0; k < block_size * block_size; k += 1) {
                r += data[((i * m + j) * block_size * block_size + k) * 4];
                g += data[((i * m + j) * block_size * block_size + k) * 4 + 1];
                b += data[((i * m + j) * block_size * block_size + k) * 4 + 2];
            }
            for (var k = 0; k < block_size * block_size; k += 1) {
                data[((i * m + j) * block_size * block_size + k) * 4] = parseInt(r / (block_size * block_size));
                data[((i * m + j) * block_size * block_size + k) * 4 + 1] = parseInt(g / (block_size * block_size));
                data[((i * m + j) * block_size * block_size + k) * 4 + 2] = parseInt(b / (block_size * block_size));
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
};


KiMiLia.prototype.encrypt = function(num_of_iter, block_size) {
    var that = this;

    var c = that.c;
    var ctx = c.getContext("2d");

    var m = parseInt(Math.floor(that.w / block_size)), n = parseInt(Math.floor(that.h / block_size));

    var permutation = [];
    for (var z=0; z<block_size*block_size; z+=1) {
        permutation.push(z);
    }

    var r1, g1, b1, r2, g2, b2, rt1, gt1, bt1, rt2, gt2, bt2, p, q;
    // substitute pixels!
    var imageData = ctx.getImageData(0, 0, that.w, that.h);
    var data = imageData.data;

    for (var ccc=0; ccc<num_of_iter; ccc+=1) {
        for (var i=0; i<n; i+=1) {
            for (var j = 0; j < m; j += 1) {
                for (var k = 0; k < block_size * block_size - 1; k += 2) {
                    p = parseInt(k / block_size);
                    q = k % block_size;

                    r1 = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4];
                    g1 = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1];
                    b1 = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2];

                    r2 = data[(i * that.w * block_size + p * that.w + j * block_size + q + 1) * 4];
                    g2 = data[(i * that.w * block_size + p * that.w + j * block_size + q + 1) * 4 + 1];
                    b2 = data[(i * that.w * block_size + p * that.w + j * block_size + q + 1) * 4 + 2];

                    rt1 = rt2 = gt1 = gt2 = bt1 = bt2 = 300;

                    while (rt1 > 255 || rt2 > 255) {
                        rt1 = parseInt(Math.random() * (r1 + r2));
                        rt2 = r1 + r2 - rt1;
                    }

                    while (gt1 > 255 || gt2 > 255) {
                        gt1 = parseInt(Math.random() * (g1 + g2));
                        gt2 = g1 + g2 - gt1;
                    }

                    while (bt1 > 255 || bt2 > 255) {
                        bt1 = parseInt(Math.random() * (b1 + b2));
                        bt2 = b1 + b2 - bt1;
                    }

                    data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4] = rt1;
                    data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1] = gt1;
                    data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2] = bt1;

                    data[(i * that.w * block_size + p * that.w + j * block_size + q + 1) * 4] = rt2;
                    data[(i * that.w * block_size + p * that.w + j * block_size + q + 1) * 4 + 1] = gt2;
                    data[(i * that.w * block_size + p * that.w + j * block_size + q + 1) * 4 + 2] = bt2;
                }
            }
        }
        //permute pixels!
        var r, g, b, r_list, g_list, b_list;
        for (var i=0; i<n; i+=1) {
            for (var j=0; j<m; j+=1) {
                r_list=[]; g_list=[]; b_list=[];
                for (var k = 0; k < block_size*block_size; k += 1) {
                    p = parseInt(k / block_size);
                    q = k % block_size;
                    r = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4];
                    g = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1];
                    b = data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2];
                    r_list.push(r);
                    g_list.push(g);
                    b_list.push(b);
                }
                permutation = shuffle(permutation);
                for (var k = 0; k < block_size*block_size; k += 1) {
                    p = parseInt(k / block_size);
                    q = k % block_size;
                    data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4] = r_list[permutation[k]];
                    data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1] = g_list[permutation[k]];
                    data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2] = b_list[permutation[k]];
                }
            }
        }
        console.log("done");
    }
    ctx.putImageData(imageData, 0, 0);
};
