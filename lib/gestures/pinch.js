(function(T, abs) {
	'use strict';

	/**
	 * Pinch gesture. Supports a pinch threshold that is used to measure when the gesture starts.
	 * Triggers `start`, `update` and `end` events.
	 * @name T.gestures.pinch
	 * @function
	 */
	var Pinch = T.Gesture.augment(function(Gesture) {

		this.defaults ={
			touches: 2,
			pinchThreshold: 12,
			preventDefault: true
		};

		this.start = function(event, data) {
			this.rect = T.utils.getRect(this.gestureHandler.element);
			this.pinch = {
				start: {},
				current: {}
			};

			if(this.hasMoreTouches(data.points)) {
				this.cancel();
				return;
			}

			this.pinch.start.point1 = data.points[0];
			this.pinch.start.point2 = data.points[1];

			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};
		
		this.update = function(event, data) {
			if(this.hasMoreTouches(data.points)) {
				this.cancel();
				return;
			} else if(this.hasEqualTouches(data.points)) {
				if(!this.pinch.start.point2) {
					this.pinch.start.point2 = data.points[1];
				} else {
					if(!data.centerPoint) {
						data.centerPoint = new T.Point(((this.pinch.start.point1.x + this.pinch.start.point2.x)/2),((this.pinch.start.point1.y + this.pinch.start.point2.y)/2) );
					}
					this.pinch.current.point1 = data.points[0];
					this.pinch.current.point2 = data.points[1];
					this.startDistance = this.pinch.start.point2.distanceTo(this.pinch.start.point1);
					this.lastDistance = this.currentDistance;
					this.currentDistance = this.pinch.current.point2.distanceTo(this.pinch.current.point1);
					this.pinchLength = abs(this.startDistance - this.currentDistance);
					this.scale = this.currentDistance / this.startDistance;
					data.scale = this.scale;
					data.delta = this.currentDistance - this.lastDistance;

					if(!this.started && this.pinchLength >= this.options.pinchThreshold) {
						this.started = true;
						this.gestureHandler.cancelGestures(this.type);
						this.binder.start.call(this, event, data);
					} else if(this.started) {
						this.binder.update.call(this, event, data);
					}
				}
			}

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

		function Pinch() {
			Gesture.apply(this, arguments);
		}
		return Pinch;
	});

	T.gestures.add('pinch', Pinch);

})(window.Touche, Math.abs);