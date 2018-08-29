To load this feature into Firefox, first clone/download the repo. In Firefox, navigate to
about:debugging, and click on Load Temporary Addon. This will open a browser in which you
will need to navigate to the folder containing the addon. Select the manifest.json file.
There should now be an icon in the top right. Click on it, and the popup should appear.

TODO: The extension's window closes if the user clicks out of it, which includes browsing for
      a photo to upload. There should be a way to keep the firefox window open. All my
      research tells me that this is impossible, though I don't know why that would be the
      case. In the meantime, a workaround is to use the addon debugger, with the "Disable
      popup auto-hide" option (in about:debugging, under the TPEncryption addon, select debug.
      This will open a window with a console exclusively for the plugin. Click on the three
      dots at the top right of this window, and click "Disable popup auto-hide").