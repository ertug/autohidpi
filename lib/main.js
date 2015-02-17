var simple_prefs = require('sdk/simple-prefs');
var preferences = require('sdk/preferences/service');
var windows = require('sdk/windows').browserWindows;
var window_utils = require('sdk/window/utils');

var x = 1;
var refresh = function() {
  var window = window_utils.getFocusedWindow();

  // when we change devPixelsPerPx it also affects availWidth so we fix it
  var width = Math.ceil(window.screen.availWidth * x);

  if (width >= simple_prefs.prefs.screenWidth) {
    x = simple_prefs.prefs.pixelRatio / 100;
  } else {
    x = 1;
  }
  preferences.set('layout.css.devPixelsPerPx', x+'');
};

windows.on('activate', refresh);
simple_prefs.on('', refresh);
refresh();
