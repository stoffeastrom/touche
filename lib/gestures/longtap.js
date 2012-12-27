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
	T.gestures.add('longtap', {
		options: {
			areaThreshold: 5,
			timeThreshold: 800,
			precedence: 5,
			preventDefault: true,
			touches: 1,
			interval: 25
		},
		interval: function() {
			++this.count;
			this.bindingObj.update.call(this.bindingObj, event, {percentage: this.count/this.intervalSteps * 100});
			if(this.count >= this.intervalSteps) {
				window.clearTimeout(this.timerId);
			}
		},
		start: function(event, data) {
			this.count = 0;
			this.intervalSteps = this.options.timeThreshold / this.options.interval;
			this.startTime = +new Date();
			if(this.hasMoreTouches(data.points)) {
				this.context.cancelGesturesWithProps({
					type: {value:'tap', operator: 'EQ'},
					touches: {value: this.options.touches, operator: 'EQ'}
				});
				return;
			}
			if(this.paused) {
				return;
			}
			var self = this;
			this.timerId = window.setInterval(function(){self.interval();}, this.options.interval);

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
			window.clearTimeout(this.timerId);
			if(this.hasNotEqualTouches(data.points) || this.paused) {
				return;
			}
			if(this.rect.pointInside(data.points[0], this.options.areaThreshold) &&
				this.startTime + this.options.timeThreshold <= +new Date()) {
				this.context.cancelGesturesWithProps({
					type: {value:'tap', operator: 'EQ'},
					touches: {value: this.options.touches, operator: 'EQ'}
				}, this);
				this.bindingObj.end.call(this, event);
			} else {
				this.context.cancelGesture(this);
			}

			if(this.preventDefault) {
				event.preventDefault();
			}
		},
		cancel: function() {
			window.clearTimeout(this.timerId);
			this.bindingObj.cancel.call(this.bindingObj);
		}
	});
})();