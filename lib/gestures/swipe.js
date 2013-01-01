(function() {
	'use strict';

	var T = window.Touche,
		abs = Math.abs;

	/**
	 * Bind a swipe gesture. Supports a radius threshold that is used to measure when the gesture starts.
	 * Triggers `start`, `update` and `end` events.
	 * @name T.gestures.swipe
	 * @function
	 * @param {Object} gesture Data to set up the gesture
	 */
	T.gestures.add('swipe', {
		options: {
			radiusThreshold: 12,
			preventDefault: true,
			touches: 1
		},
		setSwipe: function(point) {
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
			return this.swipe;
		},
		start: function(event, data) {
			this.rect = T.utils.getRect(event.target);
			this.swipe = {};
			this.swipestartFired = false;

			this.countTouches = 0;
			if(this.hasNotEqualTouches(data.points)) {
				this.context.cancelGestures('swipe');
				return;
			}

			this.swipe.startPoint = data.points[0];
			this.swipe.startTime = +new Date();

			if(this.preventDefault) {
				event.preventDefault();
			}
		},
		update: function(event, data) {
			if(this.hasNotEqualTouches(data.points)) {
				this.context.cancelGestures('swipe');
				return;
			}

			this.setSwipe(data.points[0]);
			data.swipe = this.swipe;

			if(!this.swipestartFired && this.swipe.startPoint.distanceTo(this.swipe.currentPoint) >= this.options.radiusThreshold) {
				this.context.cancelGestures('tap').cancelGestures('longtap').cancelGestures('doubletap').cancelGestures('rotate').cancelGestures('pinch');
				this.swipestartFired = true;
				this.bindingObj.start.call(this, event, data);
			} else if(this.swipestartFired) {
				this.bindingObj.update.call(this, event, data);
			}

			this.swipe.startTime = this.swipe.currentTime; //to calculate correct velocity
			if(this.preventDefault) {
				event.preventDefault();
			}
		},
		end: function(event, data) {
			if(this.swipestartFired) {
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