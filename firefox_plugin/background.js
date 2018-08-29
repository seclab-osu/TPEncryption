/**
 * Returns a handler which will open a new tab when activated.
 */


function getClickHandler() {
    console.log("***** in background.js getClickHandler");
    return function (info, tab) {
        chrome.tabs.sendMessage(tab.id, {
            text: "report_back",
            imgSrc: info.srcUrl
        }, doStuffWithDOM);
    };
};



/**
 * Create a context menu which will only show up for images.
 */


//chrome.contextMenus.create({
//    "title" : "Show Encrypted",
//    "type" : "normal",
//    "contexts" : ["image"],
//    "onclick" : getClickHandler()
//});

/* A function creator for callbacks */
function doStuffWithDOM(strDataURI) {}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log("***** in background.js chrome.runtime.onMessage.addListener");
        if (request.message == "convert_image_url_to_data_url") {
            var canvas = document.createElement("canvas");
            var img = new Image();
            img.width = request.w;
            img.height = request.h;
            canvas.width = img.width;
            canvas.height = img.height;
            img.addEventListener("load", function () {
                canvas.getContext("2d").drawImage(img, 0, 0, img.width, img.height);
                sendResponse({
                    data: canvas.toDataURL()
                });
            });
            img.src = request.url;
            return true; // Required for async sendResponse()
        } else {
            console.log("salam");
            chrome.tabs.sendMessage(tab.id, {
                text: "report_back2"
            }, doStuffWithDOM);
        }
    }
)
