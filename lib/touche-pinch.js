(function() {
	'use strict';

	var T = window.Touche,
		abs = Math.abs;

	/**
	 * Bind a pinch gesture. Supports a pinch threshold that is used to measure when the gesture starts.
	 * Triggers `start`, `update` and `end` events.
	 * @name G#pinch
	 * @param {DOMElement} elem
	 * @param {Object} Data to set up the gesture
	 */
	T.pinch = function(elem, gesture) {
		gesture = T.utils.extend({
			options: {
				pinchThreshold: 8,
				preventDefault: true
			},
			start: function() {},
			update: function() {},
			end: function() {}
		}, gesture);

		var inst = T.cache.get(elem),
			touches = 2,
			preventDefault = gesture.options.preventDefault,
			pinchThreshold = gesture.options.pinchThreshold,
			startDistance,
			currentDistance,
			pinch,
			scale,
			countTouches;

		inst.context.addGesture(T.gesture(elem, 'pinch', {
			options: gesture.options,
			start: function(event, data) {
				this.pinch = {
					start: {},
					current: {}
				};
				this.pinchstartFired = false;

				countTouches = 0;
				countTouches = event.touches && event.touches.length > countTouches ? event.touches.length : 1;
				if(countTouches > 0 && countTouches > touches) {
					inst.context.cancelGestures('pinch');
					return;
				}

				this.pinch.start.point1 = data.points[0];
				this.pinch.start.point2 = data.points[1];

				if(preventDefault) {
					event.preventDefault();
				}
			},
			update: function(event, data) {
				countTouches = event.touches && event.touches.length > countTouches ? event.touches.length : countTouches;
				if(countTouches > 0 && countTouches > touches) {
					inst.context.cancelGestures('pinch');
					return;
				} else if(countTouches === touches) {
					if(!this.pinch.start.point2) {
						this.pinch.start.point2 = data.points[1];
					} else {
						this.pinch.current.point1 = data.points[0];
						this.pinch.current.point2 = data.points[1];
						startDistance = this.pinch.start.point2.distanceTo(this.pinch.start.point1);
						currentDistance = this.pinch.current.point2.distanceTo(this.pinch.current.point1);
						pinch = abs(startDistance - currentDistance);
						scale = currentDistance / startDistance;
						data.scale = scale;

						if(!this.pinchstartFired && pinch >= pinchThreshold) {
							this.pinchstartFired = true;
							inst.context.cancelGestures('tap').cancelGestures('swipe').cancelGestures('rotate');
							gesture.start.call(this, event, data);
						} else if(this.pinchstartFired) {
							gesture.update.call(this, event, data);
						}
					}
				}

				if(preventDefault) {
					event.preventDefault();
				}
			},
			end: function(event, data) {
				if(this.pinchstartFired) {
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
})();