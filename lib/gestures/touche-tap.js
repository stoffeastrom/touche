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
	T.add('tap', {
		options: {
			areaThreshold: 5,
			precedence: 5,
			preventDefault: true,
			touches: 1
		},
		start: function(event, data) {
			if(this.hasMoreTouches(data.points)) {
				this.context.cancelGesturesWithProps({
					type: {value:'tap', operator: 'EQ'},
					touches: {value: this.options.touches, operator: 'EQ'}
				});
			}

			if(this.preventDefault) {
				event.preventDefault();
			}
		},
		update: function(event, data) {
			if(this.hasMoreTouches(data.points) ||
				!this.rect.pointInside(data.points[0], this.options.areaThreshold)) {
				this.context.cancelGesturesWithProps({
					type: {value:'tap', operator: 'EQ'},
					touches: {value: this.options.touches, operator: 'EQ'}
				});
			}

			if(this.preventDefault) {
				event.preventDefault();
			}
		},
		end: function(event, data) {
			if(this.hasNotEqualTouches(data.points)) {
				return;
			}
			if(this.rect.pointInside(data.points[0], this.options.areaThreshold)) {
				this.bindingObj.end.call(this, event, data);
			}
			if(this.preventDefault) {
				event.preventDefault();
			}
		},
		cancel: function() {
			this.bindingObj.cancel.call(this.bindingObj);
		}
	});
})();