(function() {
	'use strict';

	var T = window.Touche;

	/**
	 * Bind a doubletap event, used for basic interaction. Supports an area threshold for easier interaction
	 * on mobile devices. Triggers `start`, `update` and `end` events.
	 * @name T.gestures.doubletap
	 * @function
	 * @param {DOMElement} elem The element to bind the gesture to
	 * @param {Object} gesture Data to set up the gesture
	 */
	T.add('doubletap', function(elem, gesture) {
		gesture = T.utils.extend({
			options: {
				areaThreshold: 5,
				timeThreshold: 400,
				touches: 1,
				precedence: 4,
				preventDefault: true
			},
			start: function() {},
			update: function() {},
			end: function() {},
			cancel: function() {}
		}, gesture);

		var inst = T.cache.get(elem),
			count = 0,
			startTime, endTime, timeThreshold = gesture.options.timeThreshold,
			timerId, preventDefault = gesture.options.preventDefault;

		return T.get('tap')(elem, {
			options: gesture.options,
			end: function(event, data) {
				++count;
				if(count === 1) {
					startTime = +new Date();
					inst.context.pause('tap', this);
					timerId = setTimeout(function() {
						inst.context.play(true);
						count = 0;
					}, timeThreshold + 5);
				} else if(count === 2) {
					window.clearTimeout(timerId);
					endTime = +new Date();
					if((startTime + timeThreshold) >= endTime) {
						inst.context.play();
						gesture.end.call(this, event, data);
					}
					count = 0;
				}

				if(preventDefault) {
					event.preventDefault();
				}
			},
			cancel: function() {
				window.clearTimeout(timerId);
				gesture.cancel.call(gesture);
			}
		});
	});
})();