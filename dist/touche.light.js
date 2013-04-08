/*! Touché - v1.0.3 - 2013-03-14
* https://github.com/stoffeastrom/touche/
* Copyright (c) 2013 Christoffer Åström, Andrée Hansson; Licensed MIT */
(function(T) {
	'use strict';

	/**
	 * Tap gesture
	 * @name T.gestures.tap
	 * @function
	 */
	var Tap = T.Gesture.augment(function(Gesture) {

		this.defaults =  {
			areaThreshold: 5,
			precedence: 6,
			preventDefault: true,
			touches: 1,
			which: 1
		};

		this.start = function(event, data) {
			this.started = true;
			this.rect = T.utils.getRect(event.target);
			if( !this.isValidMouseButton(event, this.options.which) ||
				this.hasMoreTouches(data.points)) {
				this.cancel();
				return;
			}

			this.binder.start.call(this, event, data);
			
			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.update = function(event, data) {
			if(this.hasMoreTouches(data.points) ||
				!this.rect.pointInside(data.points[0], this.options.areaThreshold)) {
				this.cancel();
				return;
			}

			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.end = function(event, data) {
			if(this.hasNotEqualTouches(data.points)) {
				return;
			}
			if(this.rect.pointInside(data.points[0], this.options.areaThreshold)) {
				this.binder.end.call(this, event, data);
			}
			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.cancel = function(event, data) {
			this.cancelled = true;
			this.binder.cancel.call(this, event, data);
		};

		function Tap() {
			Gesture.apply(this, arguments);
		}

		return Tap;
	});

	/*
	* Add the Tap gesture to Touché
	*/
	T.gestures.add('tap', Tap);

})(window.Touche);
(function(T) {
	'use strict';

	/**
	 * Bind a doubletap event, used for basic interaction. Supports an area threshold for easier interaction
	 * on mobile devices.
	 * @name T.gestures.doubletap
	 * @function
	 */
	var Doubletap = T.Gesture.augment(function(Gesture) {
		this.defaults = {
			areaThreshold: 5,
			timeThreshold: 400,
			touches: 1,
			precedence: 4,
			preventDefault: true
		};

		this.on = function(elem) {
			this.count = 0;
			T(elem).on('tap', {
				id: this.id,
				end: this.end
			});
		};

		this.off = function(elem) {
			T(elem).off('tap', this.id);
		};

		this.end = function(event, data) {
			var self = this;
			++this.count;
			if(this.count === 1) {
				this.startTime = +new Date();
				this.gestureHandler.pause(null, this);
				this.timerId = setTimeout(function() {
					self.gestureHandler.play(true);
					self.count = 0;
				}, this.options.timeThreshold + 5);
			} else if(this.count === 2) {
				window.clearTimeout(this.timerId);
				this.endTime = +new Date();
				if((this.startTime + this.options.timeThreshold) >= this.endTime) {
					this.gestureHandler.play();
					this.binder.end.call(this, event, data);
				}
				this.count = 0;
			}

			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.cancel = function() {
			this.cancelled = true;
			window.clearTimeout(this.timerId);
		};

		function Doubletap() {
			Gesture.apply(this, arguments);
		}
		return Doubletap;
	});

	/*
	* Add the Doubletap gesture to Touché
	*/
	T.gestures.add('doubletap', Doubletap);

})(window.Touche);
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

(function(T, abs) {
	'use strict';

	/**
	 * Swipe gesture. Supports a radius threshold that is used to measure when the gesture starts.
	 * Triggers `start`, `update` and `end` events.
	 * @name T.gestures.swipe
	 * @function
	 */
	var Swipe = T.Gesture.augment(function(Gesture) {
		
		this.defaults = {
			radiusThreshold: 12,
			preventDefault: true,
			touches: 1,
			which: 1
		};

		this.setSwipe = function(point) {
			this.swipe.currentPoint = point;
			this.swipe.currentTime = +new Date();
			this.swipe.deltaX = this.swipe.currentPoint.x - this.swipe.startPoint.x;
			this.swipe.deltaY = this.swipe.currentPoint.y - this.swipe.startPoint.y;
			this.swipe.velocity = T.utils.getVelocity(this.swipe.startPoint, this.swipe.currentPoint, this.swipe.startTime, this.swipe.currentTime);
			this.swipe.angle = T.utils.getAngle(this.swipe.startPoint, this.swipe.currentPoint);
			this.swipe.direction = T.utils.getDirection(this.swipe.angle);
			this.swipe.elementDistance = this.swipe.direction === 'left' || this.swipe.direction === 'right' ? this.rect.width : this.rect.height;
			this.swipe.distance = this.swipe.direction === 'left' || this.swipe.direction === 'right' ? abs(this.swipe.deltaX) : abs(this.swipe.deltaY);
			this.swipe.percentage = this.swipe.distance / this.swipe.elementDistance * 100;
		};

		this.start = function(event, data) {
			this.rect = T.utils.getRect(event.target);
			this.swipe = {};

			this.countTouches = 0;
			if( !this.isValidMouseButton(event, this.options.which) ||
				this.hasNotEqualTouches(data.points)) {
				this.cancel();
				return;
			}

			this.swipe.startPoint = data.points[0];
			this.swipe.startTime = +new Date();

			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.update = function(event, data) {
			if(this.hasNotEqualTouches(data.points)) {
				this.cancel();
				return;
			}

			this.setSwipe(data.points[0]);
			data.swipe = this.swipe;

			if(!this.started && this.swipe.startPoint.distanceTo(this.swipe.currentPoint) >= this.options.radiusThreshold) {
				this.gestureHandler.cancelGestures(this.type);
				this.started = true;
				this.binder.start.call(this, event, data);
			} else if(this.started) {
				this.binder.update.call(this, event, data);
			}

			this.swipe.startTime = this.swipe.currentTime; //to calculate correct velocity
			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.end = function(event, data) {
			if(this.started) {
				this.binder.end.call(this, event, data);
			}

			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.cancel = function() {
			if(this.cancelled) {
				return;
			}
			this.cancelled = true;
			if(this.started) {
				this.binder.cancel.call(this.bindingObj);
			}
		};

		function Swipe() {
			Gesture.apply(this, arguments);
		}
		return Swipe;
	});

	/*
	* Add the Swipe gesture to Touché
	*/
	T.gestures.add('swipe', Swipe);

})(window.Touche, Math.abs);