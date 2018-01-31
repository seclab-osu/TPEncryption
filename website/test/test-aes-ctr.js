window.crypto.subtle.importKey(
    "jwk", {kty: "oct", k: "JzkR6RyuKE2qn5W243UmUpvJtH7c6p7examiYo-7NqU",
    alg: "A256CTR", ext: true}, {name: "AES-CTR"}, true, ["encrypt", "decrypt"]
)
.then(function(key){
    var rounds = [];
    for (var t = 0; t < 100000; t += 1) {
        rounds.push(t);
    }

    var startTime = new Date().getTime();

    async.map(rounds, function(round, callback) {
        window.crypto.subtle.encrypt({
                name: "AES-CTR",
                counter: new Uint8Array(16),
                length: 128
            },
            key,
            new Uint8Array([0, 0, 0, 0])
        ).then(function(encrypted){
            callback(null, new Uint8Array(encrypted))
        })
        .catch(function(err){
            console.error(err);
        });
    }, function(err, res) {
        var endTime = new Date().getTime();
        console.log("run time = " + (endTime - startTime));
    });
})
.catch(function(err){
    console.error(err);
});
