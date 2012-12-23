(function() {
	'use strict';

	var T = window.Touche;

	/**
	 * Bind a tap event, used for basic interaction. Supports an area threshold for easier interaction
	 * on mobile devices. Triggers `start`, `update` and `end` events.
	 * @name T.gestures.tap
	 * @function
	 * @param {DOMElement} elem The element to bind the gesture to
	 * @param {Object} gesture Data to set up the gesture
	 */
	T.add('tap', function(elem, gesture) {
		gesture = T.utils.extend({
			options: {
				areaThreshold: 5,
				precedence: 5,
				preventDefault: true,
				touches: 1
			},
			start: function() {},
			update: function() {},
			end: function() {},
			cancel: function() {}
		}, gesture);

		var inst = T.cache.get(elem),
			touches = gesture.options.touches,
			preventDefault = gesture.options.preventDefault;

		inst.context.addGesture(T.gesture(elem, 'tap', {
			options: gesture.options,
			start: function(event, data) {
				if(this.hasMoreTouches(data.points)) {
					inst.context.cancelGesturesWithProps({
						type: {value:'tap', operator: 'EQ'},
						touches: {value: touches, operator: 'EQ'}
					});
				}

				if(preventDefault) {
					event.preventDefault();
				}
			},
			update: function(event, data) {
				if(this.hasMoreTouches(data.points) ||
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
				if(this.hasNotEqualTouches(data.points)) {
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
	});
})();