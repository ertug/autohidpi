
// SDK varaiables for the preferences panel
var simple_prefs = require('sdk/simple-prefs');
var preferences = require('sdk/preferences/service');

// SDK variables for window status
var windows = require('sdk/windows').browserWindows;
var window_utils = require('sdk/window/utils');

//SDK variables for the toolbar button
var buttons = require('sdk/ui/button/action')


var current_pixel_ratio = 1;

// Create a toolbar button to switch the DPI Manually
var button = buttons.ActionButton({
    id: "toggle-dpi",
    label: "Toggle DPI Setting",
    icon: {
        "16": "./hidpi_switch-16.png",
        "32": "./hidpi_switch-32.png",
        "64": "./hidpi_switch-64.png"
    },

    onClick: toggle_dpi
});

// Handle a click on the switcher button
function toggle_dpi(state) {

    if( current_pixel_ratio == 1) {
        current_pixel_ratio = parseFloat(simple_prefs.prefs.pixelRatioStr);
    } else {
        current_pixel_ratio = 1
    }

  set_dppp( current_pixel_ratio )

}


// Set the pixel ratio to our desired setting
var set_dppp = function(pixel_ratio) {
  if (pixel_ratio && pixel_ratio <= 3) {
    preferences.set('layout.css.devPixelsPerPx', pixel_ratio+'');
  }
};


//Callback to update the dpi settings when window focus changes
var refresh = function() {
  var window = window_utils.getFocusedWindow();

  // when we change devPixelsPerPx it also affects availWidth so we fix it
  // sometimes it calculates the width a bit off so lets add a small slack to prevent false triggers
  var width = Math.ceil(window.screen.availWidth * current_pixel_ratio) + 128;

  if (width >= simple_prefs.prefs.screenWidth) {
    current_pixel_ratio = parseFloat(simple_prefs.prefs.pixelRatioStr);
  } else {
    current_pixel_ratio = 1;
  }

  set_dppp( current_pixel_ratio )

};

windows.on('activate', refresh);
simple_prefs.on('', refresh);
refresh();
