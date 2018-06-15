function save_options() {
  var iterations = document.getElementById('iterations').value;
  var blocksize = document.getElementById('blocksize').value;
  chrome.storage.sync.set({
    iterations: iterations,
    blocksize: blocksize
  }, function () {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function () {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    iterations: 50,
    blocksize: 16
  }, function (items) {
    document.getElementById('iterations').value = items.iterations;
    document.getElementById('blocksize').value = items.blocksize;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
