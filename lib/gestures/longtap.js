(function() {
	'use strict';

	var T = window.Touche;

	/**
	 * Bind a longtap event, used for basic interaction. Supports an area threshold for easier interaction
	 * on mobile devices. Triggers `start`, `update` and `end` events.
	 * @name T.gestures.longtap
	 * @function
	 * @param {Object} gesture Data to set up the gesture
	 */
	T.gestures.add('longtap', {
		options: {
			areaThreshold: 5,
			timeThreshold: 800,
			precedence: 5,
			preventDefault: true,
			touches: 1,
			interval: 25,
			which: 1
		},
		pause: function() {
			this.paused = true;
			window.clearTimeout(this.timerId);
		},
		start: function(event, data) {
			this.rect = T.utils.getRect(event.target);
			this.count = 0;
			this.intervalSteps = this.options.timeThreshold / this.options.interval;
			this.startTime = +new Date();
			if( !this.isValidMouseButton(event, this.options.which) ||
				this.hasMoreTouches(data.points)) {
				this.context.cancelGesturesWithProps({
					type: {value:'longtap', operator: 'EQ'},
					touches: {value: this.options.touches, operator: 'EQ'}
				});
				return;
			}

			var self = this;
			self.timerId = window.setInterval(function(){
				var percentage = self.count/self.intervalSteps * 100;
				if(self.count === 0) {
					self.bindingObj.start.call(self.bindingObj, event, {percentage: percentage});
					self.startFired = true;
				} else {
					self.bindingObj.update.call(self.bindingObj, event, {percentage: percentage});
				}
				++self.count;
				if(self.count >= self.intervalSteps) {
					window.clearTimeout(self.timerId);
				}
			}, this.options.interval);

			if(this.preventDefault) {
				event.preventDefault();
			}
		},
		update: function(event, data) {
			if(this.hasMoreTouches(data.points) ||
				!this.rect.pointInside(data.points[0], this.options.areaThreshold)) {
				this.context.cancelGesture(this);
			}
			
			if(this.preventDefault) {
				event.preventDefault();
			}
		},
		end: function(event, data) {
			window.clearTimeout(this.timerId);
			if(this.hasNotEqualTouches(data.points)) {
				this.context.cancelGesture(this);
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
			if(this.startFired && this.count > 0) {
				this.bindingObj.cancel.call(this.bindingObj);
				this.startFired = false;
			}
		}
	});
})();