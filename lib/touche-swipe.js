(function() {
	'use strict';

	var T = window.Touche,
		abs = Math.abs;

	/**
	 * Bind a swipe gesture. Supports a radius threshold that is used to measure when the gesture starts.
	 * Triggers `start`, `update` and `end` events.
	 * @name T.gestures.swipe
	 * @function
	 * @param {DOMElement} elem The element to bind the gesture to
	 * @param {Object} gesture Data to set up the gesture
	 */
	T.add('swipe', function( elem, gesture ) {
		var inst, radiusThreshold, preventDefault, useMomentum, inMomentum, inEndMomentum, lastTime, lastPoint;
		gesture = T.utils.extend({
			options: {
				radiusThreshold: 12,
				preventDefault: true,
				useMomentum: true
			},
			start: function() {
			},
			update: function() {
			},
			end: function() {
			},
			cancel: function() {
			}
		}, gesture);

		inst = T.cache.get(elem),
			radiusThreshold = gesture.options.radiusThreshold,
			preventDefault = gesture.options.preventDefault,
			useMomentum = gesture.options.useMomentum,
			inMomentum = false,
			inEndMomentum = false,
			lastPoint = { x: 0, y: 0 };

		gesture.options.touches = 1;

		inst.context.addGesture(T.gesture(elem, 'swipe', {
			options: gesture.options,
			setSwipe: function( point ) {
				this.swipe.currentPoint = point;
				this.swipe.currentTime = +new Date();
				this.swipe.deltaX = this.swipe.currentPoint.x - this.swipe.startPoint.x;
				this.swipe.deltaY = this.swipe.currentPoint.y - this.swipe.startPoint.y;
				this.swipe.curDeltaX = this.swipe.currentPoint.x - lastPoint.x;
				this.swipe.curDeltaY = this.swipe.currentPoint.y - lastPoint.y;
				this.swipe.velocity = T.utils.getVelocity(this.swipe.startPoint, this.swipe.currentPoint, this.swipe.startTime, this.swipe.currentTime);
				this.swipe.momentum = T.utils.getVelocity(lastPoint, this.swipe.currentPoint, lastTime, this.swipe.currentTime);
				this.swipe.angle = T.utils.getAngle(this.swipe.startPoint, this.swipe.currentPoint);
				this.swipe.direction = T.utils.getDirection(this.swipe.angle);
				this.swipe.elementDistance = this.swipe.direction === 'left' || this.swipe.direction === 'right' ? this.rect.width : this.rect.height;
				this.swipe.distance = this.swipe.direction === 'left' || this.swipe.direction === 'right' ? abs(this.swipe.deltaX) : abs(this.swipe.deltaY);
				this.swipe.percentage = this.swipe.distance / this.swipe.elementDistance * 100;
				return this.swipe;
			},
			start: function( event, data ) {
				this.swipe = {};
				this.swipestartFired = false;
				//lastPoint = { x:data.points[0].x, y:data.points[0].y };
				inMomentum = false;
				inEndMomentum = false;
				this.countTouches = 0;
				if (this.hasNotEqualTouches(event)) {
					inst.context.cancelGestures('swipe');
					return;
				}

				this.swipe.startPoint = lastPoint = data.points[0];
				this.swipe.startTime = lastTime = +new Date();

				if (preventDefault) {
					event.preventDefault();
				}
			},
			update: function( event, data ) {
				var tempTime;
				if (this.hasNotEqualTouches(event)) {
					inst.context.cancelGestures('swipe');
					return;
				}
				inMomentum = true;
				tempTime = this.swipe.currentTime;
				this.setSwipe(data.points[0]);
				data.swipe = this.swipe;
				lastPoint = data.points[0];
				lastTime = tempTime;


				if (!this.swipestartFired && this.swipe.startPoint.distanceTo(this.swipe.currentPoint) >= radiusThreshold) {
					inst.context.cancelGestures('tap').cancelGestures('rotate').cancelGestures('pinch');
					this.swipestartFired = true;
					gesture.start.call(this, event, data);
				} else if (this.swipestartFired) {
					gesture.update.call(this, event, data);
				}

				this.swipe.startTime = this.swipe.currentTime; //to calculate correct velocity
				if (preventDefault) {
					event.preventDefault();
				}
			},
			end: function( event, data ) {
				var p, m, that, dataPoint, keepOn;
				if (this.swipestartFired) {
					if (useMomentum && inMomentum) {
						inEndMomentum = true;
						p = new T.Point(this.swipe.curDeltaX, this.swipe.curDeltaY).normalize(),
							m = this.swipe.momentum,
							that = this,
							dataPoint = new T.Point(data.points[0].x, data.points[0].y),
							keepOn = function() {
								m *= 0.95;
								if (inEndMomentum && m > 1) {
									dataPoint.x += p.x * m;
									dataPoint.y += p.y * m;
									data.points[0] = new T.Point(dataPoint.x, dataPoint.y);
									that.update(event, data);
									window.requestAnimationFrame(keepOn);
								} else {
									gesture.end.call(that, event, data);
								}
							};
						window.requestAnimationFrame(keepOn);
					} else {
						gesture.end.call(this, event, data);
					}
				}

				if (preventDefault) {
					event.preventDefault();
				}
			},
			cancel: function() {
				gesture.cancel.call(gesture);
			}
		}));

		return T;
	});
})();