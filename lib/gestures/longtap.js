(function(T) {
	'use strict';

	/**
	 * Longtap gesture, Supports an area threshold for easier interaction
	 * on mobile devices. Triggers `start`, `update` and `end` events.
	 * @name T.gestures.longtap
	 * @function
	 */
	var Longtap = T.Gesture.augment(function(Gesture) {

		this.defaults = {
			areaThreshold: 5,
			timeThreshold: 800,
			precedence: 5,
			preventDefault: true,
			touches: 1,
			interval: 25,
			which: 1
		};

		this.preventDefaultForMSPointer = function(on) {
			if(!T.utils.msPointer) {
				return;
			}

			var doc = window.document,
				events = ['MSGestureHold', 'contextmenu'],
				prevent = function(e) {
					e.preventDefault();
				};

			on = on || true;
			events.forEach(function(event) {
				doc[on ? 'addEventListener' : 'removeEventListener'](event, prevent, false);
			});
		};

		this.pause = function() {
			this.paused = true;
			window.clearTimeout(this.timerId);
		};

		this.start = function(event, data) {
			if( !this.isValidMouseButton(event, this.options.which) ||
				this.hasMoreTouches(data.points)) {
				this.cancel();
				return;
			}
			this.rect = T.utils.getRect(event.target);
			this.count = 0;
			this.intervalSteps = this.options.timeThreshold / this.options.interval;
			this.startTime = +new Date();

			var self = this;
			window.clearTimeout(self.timerId);
			self.timerId = window.setInterval(function(){
				++self.count;
				data.percentage = self.count/self.intervalSteps * 100;
								
				if(self.count === 1) {
					self.binder.start.call(self.binder, event, data);
					self.startFired = true;
				} else {
					self.binder.update.call(self.binder, event, data);
				}

				if(self.count >= self.intervalSteps) {
					window.clearTimeout(self.timerId);
				}
			}, this.options.interval);

			if(this.options.preventDefault) {
				event.preventDefault();
				this.preventDefaultForMSPointer();
			}
		};

		this.update = function(event, data) {
			if(this.hasMoreTouches(data.points) ||
				!this.rect.pointInside(data.points[0], this.options.areaThreshold)) {
				this.cancel();
			}
			
			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};
		
		this.end = function(event, data) {
			window.clearTimeout(this.timerId);
			if(this.hasNotEqualTouches(data.points)) {
				this.cancel();
				return;
			}
			if(this.rect.pointInside(data.points[0], this.options.areaThreshold) &&
				this.startTime + this.options.timeThreshold <= +new Date()) {
				this.gestureHandler.cancelGestures(this.type);
				this.binder.end.call(this, event, data);
			} else {
				this.cancel();
			}

			if(this.options.preventDefault) {
				event.preventDefault();
				this.preventDefaultForMSPointer(false);
			}
		};

		this.cancel = function() {
			if(this.cancelled) {
				return;
			}
			this.cancelled = true;
			window.clearTimeout(this.timerId);
			if(this.startFired && this.count > 0) {
				this.binder.cancel.call(this.binder);
				this.startFired = false;
			}
			this.preventDefaultForMSPointer(false);
		};

		function Longtap() {
			Gesture.apply(this, arguments);
		}
		return Longtap;
	});

	/*
	* Add the Longtap gesture to Touché
	*/
	T.gestures.add('longtap', Longtap);

})(window.Touche);
