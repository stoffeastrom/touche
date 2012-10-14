(function() {
	'use strict';

	var T = window.Touche;

	/**
	 * Bind a tap event, used for basic interaction. Supports an area threshold for easier interaction
	 * on mobile devices. Triggers `start`, `update` and `end` events.
	 * @name G#tap
	 * @param {DOMElement} elem
	 * @param {Object} Data to set up the gesture
	 */
	T.tap = function(elem, gesture) {
		gesture = T.utils.extend({
			options: {
				areaThreshold: 5,
				precedence: 5,
				preventDefault: true,
				touches: 1
			},
			start: function() {},
			update: function() {},
			end: function() {}
		}, gesture);

		var inst = T.cache.get(elem),
			touches = gesture.options.touches,
			preventDefault = gesture.options.preventDefault,
			countTouches;

		inst.context.addGesture(T.gesture(elem, 'tap', {
			options: gesture.options,
			start: function(event) {
				countTouches = 0;
				countTouches = event.touches && event.touches.length > countTouches ? event.touches.length : 1;
				if(countTouches > 0 && countTouches > touches) {
					inst.context.cancelGesturesWithTouches('tap', touches);
				}

				if(preventDefault) {
					event.preventDefault();
				}
			},
			update: function(event) {
				countTouches = event.touches && event.touches.length > countTouches ? event.touches.length : countTouches;
				if(countTouches > 0 && countTouches > touches) {
					inst.context.cancelGesturesWithTouches('tap', touches);
				}
				/*
				 * Maybe handle in/out
				 */
				if(preventDefault) {
					event.preventDefault();
				}
			},
			end: function(event, data) {
				if(countTouches > 0 && countTouches !== touches) {
					return;
				}
				if(this.rect.pointInside(data.points[0], this.options.areaThreshold)) {
					gesture.end.call(this, event, data);
				}
				if(preventDefault) {
					event.preventDefault();
				}
			},
			cancel: function() {
				gesture.cancel.call(gesture);
			}
		}));
		return T;
	};

	/**
	 * Bind a doubletap event, used for basic interaction. Supports an area threshold for easier interaction
	 * on mobile devices. Triggers `start`, `update` and `end` events.
	 * @name G#doubletap
	 * @param {DOMElement} elem
	 * @param {Object} Data to set up the gesture
	 */
	T.doubletap = function(elem, gesture) {
		gesture = T.utils.extend({
			options: {
				areaThreshold: 5,
				timeThreshold: 500,
				precedence: 5,
				preventDefault: true
			},
			start: function() {},
			update: function() {},
			end: function() {}
		}, gesture);

		var count = 0,
			startTime, endTime, timeThreshold = gesture.options.timeThreshold,
			timerId, preventDefault = gesture.options.preventDefault;

		return T.tap(elem, {
			end: function(event, data) {
				++count;
				if(count === 1) {
					startTime = +new Date();
					timerId = setTimeout(function() {
						count = 0;
					}, timeThreshold + 50);
				} else if(count === 2) {
					clearTimeout(timerId);
					endTime = +new Date();
					if((startTime + timeThreshold) >= endTime) {
						gesture.end.call(this, event, data);
					}
					count = 0;
				}

				if(preventDefault) {
					event.preventDefault();
				}
			},
			cancel: function() {
				gesture.cancel.call(gesture);
			}
		});
	};
})();