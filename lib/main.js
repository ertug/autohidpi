var simple_prefs = require('sdk/simple-prefs');
var preferences = require('sdk/preferences/service');
var windows = require('sdk/windows').browserWindows;
var window_utils = require('sdk/window/utils');

var x = 1;
var refresh = function() {
  var window = window_utils.getFocusedWindow();

  // when we change devPixelsPerPx it also affects availWidth so we fix it
  var width = window.screen.availWidth * x;

  if (width >= simple_prefs.prefs['screenWidth']) {
    var pixelRatioMapping = {
      0: 1.5,
      1: 2
    };
    x = pixelRatioMapping[simple_prefs.prefs['pixelRatio']];
  } else {
    x = 1;
  }

  preferences.set('layout.css.devPixelsPerPx', x+'');

  //console.log('width=' + width + ' x=' + x);
};

windows.on('activate', refresh);
simple_prefs.on('', refresh);
