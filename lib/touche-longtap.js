(function() {
	'use strict';

	var T = window.Touche;

	/**
	 * Bind a longtap event, used for basic interaction. Supports an area threshold for easier interaction
	 * on mobile devices. Triggers `start`, `update` and `end` events.
	 * @name T.gestures.longtap
	 * @function
	 * @param {DOMElement} elem The element to bind the gesture to
	 * @param {Object} gesture Data to set up the gesture
	 */
	T.add('longtap', function(elem, gesture) {
		gesture = T.utils.extend({
			options: {
				areaThreshold: 5,
				timeThreshold: 800,
				precedence: 5,
				preventDefault: true,
				touches: 1,
				interval: 25
			},
			start: function() {},
			update: function() {},
			end: function() {},
			cancel: function() {}
		}, gesture);

		var inst = T.cache.get(elem),
			interval = gesture.options.interval,
			count,
			touches = gesture.options.touches,
			startTime, timerId, timeThreshold = gesture.options.timeThreshold,
			intervalSteps = timeThreshold / interval,
			preventDefault = gesture.options.preventDefault;

		inst.context.addGesture(T.gesture(elem, 'tap', {
			options: gesture.options,
			interval: function() {
				++count;
				gesture.update.call(gesture, event, {percentage: count/intervalSteps * 100});
				if(count >= intervalSteps) {
					window.clearTimeout(timerId);
				}
			},
			start: function(event) {
				count = 0;
				startTime = +new Date();
				if(this.hasMoreTouches(event)) {
					inst.context.cancelGesturesWithProps({
						type: {value:'tap', operator: 'EQ'},
						touches: {value: touches, operator: 'EQ'}
					});
					return;
				}
				if(this.paused) {
					return;
				}
				timerId = window.setInterval(this.interval, interval);

				if(preventDefault) {
					event.preventDefault();
				}
			},
			update: function(event, data) {
				if(this.hasMoreTouches(event) ||
					!this.rect.pointInside(data.points[0], this.options.areaThreshold)) {
					inst.context.cancelGesturesWithProps({
						type: {value:'tap', operator: 'EQ'},
						touches: {value: touches, operator: 'EQ'}
					});
				}
				
				if(preventDefault) {
					event.preventDefault();
				}
			},
			end: function(event, data) {
				window.clearTimeout(timerId);
				if(this.hasNotEqualTouches(event) || this.paused) {
					return;
				}
				if(this.rect.pointInside(data.points[0], this.options.areaThreshold) &&
					startTime + timeThreshold <= +new Date()) {
					inst.context.cancelGesturesWithProps({
						type: {value:'tap', operator: 'EQ'},
						touches: {value: touches, operator: 'EQ'}
					}, this);
					gesture.end.call(this, event);
				} else {
					inst.context.cancelGesture(this);
				}

				if(preventDefault) {
					event.preventDefault();
				}
			},
			cancel: function() {
				window.clearTimeout(timerId);
				gesture.cancel.call(gesture);
			}
		}));

		return T;
	});
})();