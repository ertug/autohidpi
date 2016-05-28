var simplePrefs = require('sdk/simple-prefs');
var preferences = require('sdk/preferences/service');
var windowUtils = require('sdk/window/utils');
var { setInterval } = require('sdk/timers');

const UPDATE_INTERVAL_MS = 1000;
const SLACK = 128;
var currentPixelRatio = null;

function getActiveScreenWidth() {
  // changing devPixelsPerPx messes with screen.width, we correct it here
  var width = windowUtils.getFocusedWindow().screen.width;
  return width * (currentPixelRatio ? currentPixelRatio : 1);
}

function setDevPixelsPerPx(pixelRatio) {
  if (pixelRatio && pixelRatio <= 3 && pixelRatio != currentPixelRatio) {
    preferences.set('layout.css.devPixelsPerPx', pixelRatio+'');
    currentPixelRatio = pixelRatio;
  }
}

function update() {
  // sometimes it calculates the width a bit off so we add a small slack to prevent false triggers
  if (getActiveScreenWidth() + SLACK >= simplePrefs.prefs.screenWidth) {
    // enable
    setDevPixelsPerPx(parseFloat(simplePrefs.prefs.pixelRatioStr))
  } else {
    // disable
    setDevPixelsPerPx(1);
  }
}

setInterval(update, UPDATE_INTERVAL_MS);
