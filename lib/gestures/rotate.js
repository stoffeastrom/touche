(function() {
	'use strict';

	var T = window.Touche;

	/**
	 * Bind a rotate gesture. Supports a rotation threshold that is used to measure when the gesture starts.
	 * Triggers `start`, `update` and `end` events.
	 * @name T.gestures.rotate
	 * @function
	 * @param {DOMElement} elem The element to bind the gesture to
	 * @param {Object} gesture Data to set up the gesture
	 */
	T.gestures.add('rotate', {
		options: {
			rotationThreshold: 12,
			preventDefault: true
		},
		start: function(event, data) {
			this.rotate = {
				start: {},
				current: {}
			};
			this.rotationstartFired = false;

			if(this.hasMoreTouches(data.points)) {
				this.context.cancelGestures('rotate');
				return;
			}

			this.rotate.start.point1 = data.points[0];
			this.rotate.start.point2 = data.points[1];

			if(this.preventDefault) {
				event.preventDefault();
			}
		},
		update: function(event, data) {
			if(this.hasMoreTouches(data.points)) {
				this.context.cancelGestures('rotate');
				return;
			} else if(this.countTouches === this.options.touches) {
				if(!this.rotate.start.point2) {
					this.rotate.start.point2 = data.points[1];
				} else {
					this.rotate.current.point1 = data.points[0];
					this.rotate.current.point2 = data.points[1];
					this.startAngle = T.utils.getDeltaAngle(this.rotate.start.point2, this.rotate.start.point1);
					this.currentAngle = T.utils.getDeltaAngle(this.rotate.current.point2, this.rotate.current.point1);
					this.rotation = this.currentAngle - this.startAngle;
					data.rotation = this.rotation;

					if(!this.rotationstartFired && this.rotation >= this.options.rotationThreshold) {
						this.rotationstartFired = true;
						this.context.cancelGestures('tap').cancelGestures('longtap').cancelGestures('doubletap').cancelGestures('swipe').cancelGestures('pinch');
						this.bindingObj.start.call(this, event, data);
					} else if(this.rotationstartFired) {
						this.bindingObj.update.call(this, event, data);
					}
				}
			}

			if(this.preventDefault) {
				event.preventDefault();
			}
		},
		end: function(event, data) {
			if(this.rotationstartFired) {
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