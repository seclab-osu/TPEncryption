var TPEncryption = function TPEncryption(canvasId, key) {
    var that = this;
    that.mat_r = [];
    that.mat_g = [];
    that.mat_b = [];

    that.canvasId = canvasId;
    that.key = aesjs.util.convertStringToBytes(key);

    var c = document.getElementById(that.canvasId);
    that.w = c.width;
    that.h = c.height;
    that.block_size = 0;

    var ctx = c.getContext("2d");
    that.canvasImgData = ctx.getImageData(0, 0, that.w, that.h);

    //that.thumb(5);
};


TPEncryption.prototype.thumb = function() {
    var that = this;
    var block_size = that.block_size;
    var c = document.getElementById(that.canvasId);
    var ctx = c.getContext("2d");
    var imageData = ctx.getImageData(0, 0, that.w, that.h);
    var data = imageData.data;
    var m = parseInt(Math.floor(that.w / block_size)), n = parseInt(Math.floor(that.h / block_size));
    var r, g, b, p, g, p, q;
    for (var i=0; i<n; i+=1) {
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
    ctx.putImageData(imageData, 0, 0);
};


TPEncryption.prototype.encrypt = function(num_of_iter, block_size) {
    var that = this;
    that.block_size = block_size;

    var c = document.getElementById(that.canvasId);
    var ctx = c.getContext("2d");

    var m = parseInt(Math.floor(that.w / block_size)), n = parseInt(Math.floor(that.h / block_size));

    var permutation = [];
    var r1, g1, b1, r2, g2, b2, rt1, gt1, bt1, rt2, gt2, bt2, p, q, x, y;
    // substitute pixels!
    var imageData = ctx.getImageData(0, 0, that.w, that.h);
    var data = imageData.data;

    var sAesRndNumGen = new AesRndNumGen(that.key);
    var pAesRndNumGen = new AesRndNumGen(that.key);

    var start = new Date().getTime();
    for (var ccc=0; ccc<num_of_iter; ccc+=1) {
        // substitution
        for (var i=0; i<n; i+=1) {
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

                permutation = pAesRndNumGen.getNewPermutation(block_size);
                //var sr = 0, sg= 0, sb=0;
                for (var k = 0; k < block_size*block_size; k += 1) {
                    p = parseInt(k / block_size);
                    q = k % block_size;
                    data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4] = r_list[permutation[k]];
                    data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1] = g_list[permutation[k]];
                    data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2] = b_list[permutation[k]];
                }
            }
        }
    }
    var end = new Date().getTime();
    //console.log("done in " + (end - start) + " ms. number of rnd generated = " + (sAesRndNumGen.ctr + pAesRndNumGen.ctr));
    ctx.putImageData(imageData, 0, 0);
    return end - start;
};


TPEncryption.prototype.decrypt = function(num_of_iter, block_size) {
    var that = this;
    that.block_size = block_size;

    var c = document.getElementById(that.canvasId);
    var ctx = c.getContext("2d");

    var m = parseInt(Math.floor(that.w / block_size)), n = parseInt(Math.floor(that.h / block_size));

    var permutation = [];
    var r1, g1, b1, r2, g2, b2, rt1, gt1, bt1, rt2, gt2, bt2, p, q, x, y;
    // substitute pixels!
    var imageData = ctx.getImageData(0, 0, that.w, that.h);
    var data = imageData.data;

    var sAesRndNumGen = new AesRndNumGen(that.key);
    var pAesRndNumGen = new AesRndNumGen(that.key);

    var totalRndForPermutation = num_of_iter * n * m * block_size * block_size;
    var totalRndForSubstitution = num_of_iter * n * m * parseInt((block_size * block_size - (block_size*block_size)%2)/2) * 3;

    pAesRndNumGen.ctr = totalRndForPermutation;
    sAesRndNumGen.ctr = totalRndForSubstitution;

    var start = new Date().getTime();
    for (var ccc=0; ccc<num_of_iter; ccc+=1) {

        sAesRndNumGen.ctr = (num_of_iter - (ccc + 1)) * (totalRndForSubstitution / num_of_iter);
        pAesRndNumGen.ctr = (num_of_iter - (ccc + 1)) * (totalRndForPermutation / num_of_iter);

        console.log(sAesRndNumGen.ctr);

        // permutation reverse
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
                permutation = pAesRndNumGen.getNewPermutation(block_size);

                //var sr = 0, sg= 0, sb=0;
                for (var k = 0; k < block_size*block_size; k += 1) {
                    p = parseInt(permutation[k] / block_size);
                    q = permutation[k] % block_size;
                    data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4] = r_list[k];
                    data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 1] = g_list[k];
                    data[(i * that.w * block_size + p * that.w + j * block_size + q) * 4 + 2] = b_list[k];
                }
            }
        }
        // substitution reverse
        for (var i=0; i<n; i+=1) {
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
    return end - start;
};


var AesRndNumGen = function AesRndNumGen(key) {
    this.aesCtr = new aesjs.ModeOfOperation.ctr(key);
    this.ctr = 0;
    this.data = [0, 0, 0, 0];
};

AesRndNumGen.prototype.next = function next() {
    this.aesCtr._counter = new aesjs.Counter(this.ctr);
    this.aesCtr._remainingCounter = null;
    this.aesCtr._remainingCounterIndex = 16;
    this.ctr += 1;
    var encryptedBytes = this.aesCtr.encrypt(this.data);
    return encryptedBytes[3] + encryptedBytes[2] * 256 + encryptedBytes[1] * 65536 + encryptedBytes[0] * 16777216;
};

AesRndNumGen.prototype.getNewCouple = function getNewCouple(p, q, enc) {
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
        }
        else {
            rnd = (255 - p - rnd) % (511 - sum);
            while (rnd < (sum - 255)) {
                rnd += 511 - sum;
            }
            return rnd;
        }
    }
};

AesRndNumGen.prototype.getNewPermutation = function getNewPermutation(block_size) {
    var that = this;
    var permutation = [];
    for (var z=0; z<block_size*block_size; z+=1) {
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
