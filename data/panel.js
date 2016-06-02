var geometry = document.getElementById('geometry');
var pixelRatioInput = document.getElementById('pixelRatio');
var pixelRatioDisplay = document.getElementById('pixelRatioDisplay');

pixelRatioInput.addEventListener('input', function (event) {
  pixelRatioDisplay.innerHTML = event.target.value + 'x';
}, false);

pixelRatioInput.addEventListener('change', function (event) {
  self.port.emit('pixelRatioChanged', parseFloat(event.target.value));
}, false);

self.port.on('update', function (event) {
  geometry.innerHTML = 'width=' + event.screen.width +
                       ' height=' + event.screen.height +
                       ' left=' + event.screen.left +
                       ' top=' + event.screen.top;
  pixelRatioInput.value = event.pixelRatio;
  pixelRatioDisplay.innerHTML = event.pixelRatio + 'x';
});
