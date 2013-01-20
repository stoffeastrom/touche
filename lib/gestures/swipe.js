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