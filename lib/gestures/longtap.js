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
			radiusThreshold: 12,
			timeThreshold: 800,
			precedence: 5,
			preventDefault: true,
			touches: 1,
			interval: 25,
			which: 1
		};

		this.preventDefaultForMSPointer = function(on) {
			if(!T.utils.pointerEnabled) {
				return;
			}

			var doc = window.document,
				events = ['MSHoldVisual', 'MSGestureHold', 'contextmenu'],
				prevent = function(e) {
					e.preventDefault();
				};

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
				this.hasMoreTouches(data.pagePoints)) {
				this.cancel();
				return;
			}
			this.rect = T.utils.getRect(this.gestureHandler.element);
			this.count = 0;
			this.intervalSteps = this.options.timeThreshold / this.options.interval;
			this.startTime = +new Date();
			this.startPoint = data.pagePoints[0];

			var instance = this;
			window.clearTimeout(instance.timerId);
			instance.timerId = window.setInterval(function(){
				++instance.count;
				data.percentage = instance.count/instance.intervalSteps * 100;
								
				if(instance.count === 1) {
					instance.started = true;
					instance.binder.start.call(instance, event, data);
				} else {
					instance.binder.update.call(instance, event, data);
				}

				if(instance.count >= instance.intervalSteps) {
					window.clearTimeout(instance.timerId);
				}
			}, this.options.interval);

			if(this.options.preventDefault) {
				event.preventDefault();
				T.WebkitHack.prevent();
				this.preventDefaultForMSPointer(true);
			}
		};

		this.update = function(event, data) {
			if(this.hasMoreTouches(data.pagePoints) ||
				this.startPoint.distanceTo(data.pagePoints[0]) > this.options.radiusThreshold) {
				this.cancel();
			}
			
			if(this.options.preventDefault) {
				event.preventDefault();
				T.WebkitHack.prevent();
			}
		};
		
		this.end = function(event, data) {
			window.clearTimeout(this.timerId);
			if(this.hasNotEqualTouches(data.pagePoints)) {
				this.cancel();
				return;
			}
			if(this.startPoint.distanceTo(data.pagePoints[0]) <= this.options.radiusThreshold &&
				this.startTime + this.options.timeThreshold <= +new Date()) {
				this.gestureHandler.cancelGestures(this.type);
				this.binder.end.call(this, event, data);
			} else {
				this.cancel();
			}

			if(this.options.preventDefault) {
				event.preventDefault();
				T.WebkitHack.prevent();
				this.preventDefaultForMSPointer(false);
			}
		};

		this.cancel = function() {
			window.clearTimeout(this.timerId);
			if(this.cancelled) {
				return;
			}
			this.cancelled = true;
			if(this.started) {
				this.binder.cancel.call(this);
			}
			if(this.options.preventDefault) {
				this.preventDefaultForMSPointer(false);
			}
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
