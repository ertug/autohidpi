var simplePrefs = require('sdk/simple-prefs');
var preferences = require('sdk/preferences/service');
var windowUtils = require('sdk/window/utils');
var { setInterval, clearInterval } = require('sdk/timers');
var { ToggleButton } = require('sdk/ui/button/toggle');
var { Panel } = require('sdk/panel');
var self = require('sdk/self');
var storage = require('sdk/simple-storage').storage;
var events = require('sdk/system/events');

const DEFAULT_PIXEL_RATIO = 1;
const UPDATE_INTERVAL_MS = 500;
const SLACK = 128;

///////////////////////////////////////////////////////////////////////////
// user interface
///////////////////////////////////////////////////////////////////////////

var button = ToggleButton({
  id: 'autohidpi',
  label: 'AutoHiDPI',
  icon: {
    '24': './ic_desktop_windows_black_24dp_1x.png',
    '48': './ic_desktop_windows_black_24dp_2x.png'
  },
  onChange: handleButtonChange
});

var panel = Panel({
  width: 350,
  height: 270,
  contentURL: self.data.url('panel.html'),
  contentScriptFile: self.data.url('panel.js'),
  onHide: handlePanelHide
});

function handleButtonChange(state) {
  if (state.checked) {
    update(true);

    panel.show({
      position: button
    });
  }
}

function handlePanelHide() {
  button.state('window', {checked: false});
}

///////////////////////////////////////////////////////////////////////////
// storage
///////////////////////////////////////////////////////////////////////////

if (!storage.pixelRatios) {
  storage.pixelRatios = {}
}

function loadPixelRatio(screen) {
  var screenId = buildScreenId(screen);
  var pixelRatio = storage.pixelRatios[screenId];
  if (pixelRatio) {
    return pixelRatio;
  } else if (simplePrefs.prefs.screenWidth && screen.width + SLACK >= simplePrefs.prefs.screenWidth) {
    // backward compatibility
    return parseFloat(simplePrefs.prefs.pixelRatioStr);
  } else {
    return DEFAULT_PIXEL_RATIO;
  }
}

function savePixelRatio(screen, pixelRatio) {
  var screenId = buildScreenId(screen);
  storage.pixelRatios[screenId] = pixelRatio;
}

///////////////////////////////////////////////////////////////////////////
// utils
///////////////////////////////////////////////////////////////////////////

function getActiveScreen() {
  return windowUtils.getFocusedWindow().screen;
}

function buildScreenId(screen) {
  return [screen.width, screen.height, screen.left, screen.top].join(',');
}

var currentPixelRatio = null;

function setDevPixelsPerPx(pixelRatio) {
  if (pixelRatio && pixelRatio != currentPixelRatio) {
    console.log('setDevPixelsPerPx', pixelRatio);
    preferences.set('layout.css.devPixelsPerPx', pixelRatio+'');
    currentPixelRatio = pixelRatio;
  }
}

function resetDevPixelsPerPx() {
  // reset devPixelsPerPx to be able get non-scaled values for the screen geometry afterwards
  setDevPixelsPerPx(DEFAULT_PIXEL_RATIO);
}

///////////////////////////////////////////////////////////////////////////
// event handlers
///////////////////////////////////////////////////////////////////////////

var lastScreenId = null;

function update(force) {
  console.log('update', force);

  var screen = getActiveScreen();

  // quick check to detect active screen change
  var screenId = buildScreenId(screen);
  if (force || lastScreenId != screenId) {
    console.log('active screen changed', screenId);

    resetDevPixelsPerPx();

    var pixelRatio = loadPixelRatio(screen);
    console.log('loaded pixelRatio', pixelRatio);

    var event = {
      // populate screen geometry before changing devPixelsPerPx
      screen: {
        width: screen.width,
        height: screen.height,
        left: screen.left,
        top: screen.top
      },
      pixelRatio: pixelRatio
    };

    setDevPixelsPerPx(pixelRatio);

    panel.port.emit('update', event);

    lastScreenId = buildScreenId(screen);
  }
}

var timerId = null;

events.on('user-interaction-active', function () {
  console.log('user-interaction-active');

  if (!timerId) {
    timerId = setInterval(update, UPDATE_INTERVAL_MS);
  }
}, true);

events.on('user-interaction-inactive', function () {
  console.log('user-interaction-inactive');

  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}, true);

panel.port.on('pixelRatioChanged', function (pixelRatio) {
  resetDevPixelsPerPx();

  savePixelRatio(getActiveScreen(), pixelRatio);
  console.log('saved pixelRatio', pixelRatio);

  update(true);
});

update(true);
