(function() {
	'use strict';

	var T = window.Touche,
		abs = Math.abs;

	/**
	 * Bind a pinch gesture. Supports a pinch threshold that is used to measure when the gesture starts.
	 * Triggers `start`, `update` and `end` events.
	 * @name T.gestures.pinch
	 * @function
	 * @param {Object} gesture Data to set up the gesture
	 */
	T.gestures.add('pinch', {
		options: {
			pinchThreshold: 8,
			preventDefault: true
		},
		start: function(event, data) {
			this.rect = T.utils.getRect(event.target);
			this.pinch = {
				start: {},
				current: {}
			};

			if(this.hasMoreTouches(data.points)) {
				this.context.cancelGestures('pinch');
				return;
			}

			this.pinch.start.point1 = data.points[0];
			this.pinch.start.point2 = data.points[1];

			if(this.preventDefault) {
				event.preventDefault();
			}
		},
		update: function(event, data) {
			if(this.hasMoreTouches(data.points)) {
				this.context.cancelGestures('pinch');
				return;
			} else if(this.countTouches === this.options.touches) {
				if(!this.pinch.start.point2) {
					this.pinch.start.point2 = data.points[1];
				} else {
					this.pinch.current.point1 = data.points[0];
					this.pinch.current.point2 = data.points[1];
					this.startDistance = this.pinch.start.point2.distanceTo(this.pinch.start.point1);
					this.currentDistance = this.pinch.current.point2.distanceTo(this.pinch.current.point1);
					this.pinch = abs(this.startDistance - this.currentDistance);
					this.scale = this.currentDistance / this.startDistance;
					data.scale = this.scale;

					if(!this.started && this.pinch >= this.options.pinchThreshold) {
						this.started = true;
						this.context.cancelGestures('tap').cancelGestures('longtap').cancelGestures('doubletap').cancelGestures('swipe').cancelGestures('rotate');
						this.bindingObj.start.call(this, event, data);
					} else if(this.started) {
						this.bindingObj.update.call(this, event, data);
					}
				}
			}

			if(this.preventDefault) {
				event.preventDefault();
			}
		},
		end: function(event, data) {
			if(this.started) {
				this.bindingObj.end.call(this, event, data);
			}

			if(this.preventDefault) {
				event.preventDefault();
			}
		},
		cancel: function() {
			if(this.started) {
				this.bindingObj.cancel.call(this.bindingObj);
			}
		}
	});
})();