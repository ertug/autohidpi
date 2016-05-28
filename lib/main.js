var simple_prefs = require('sdk/simple-prefs');
var preferences = require('sdk/preferences/service');
var windows = require('sdk/windows').browserWindows;
var window_utils = require('sdk/window/utils');
var events = require('sdk/system/events');

var x = 1;
var refresh = function() {
  var window = window_utils.getFocusedWindow();

  // when we change devPixelsPerPx it also affects availWidth so we fix it
  // sometimes it calculates the width a bit off so lets add a small slack to prevent false triggers
  var width = Math.ceil(window.screen.availWidth * x) + 128;

  if (width >= simple_prefs.prefs.screenWidth) {
    x = parseFloat(simple_prefs.prefs.pixelRatioStr);
  } else {
    x = 1;
  }

  if (x && x <= 3) {
    preferences.set('layout.css.devPixelsPerPx', x+'');
  }
};

events.on('user-interaction-active', refresh);
windows.on('activate', refresh);
simple_prefs.on('', refresh);
refresh();
