(function(T, abs) {
	'use strict';

	/**
	 * Swipe gesture. Supports a radius threshold that is used to measure when the gesture starts.
	 * Triggers `start`, `update` and `end` events.
	 * @name T.gestures.swipe
	 * @function
	 */
	var Swipe = T.Gesture.augment(function(Gesture) {
		this.rAFId = -1;

		this.defaults = {
			radiusThreshold: 12,
			preventDefault: true,
			touches: 1,
			which: 1,
			useMomentum: false,
			inertia: 0.89
		};

		this.setSwipe = function(point) {
			this.swipe.lastTime = this.swipe.currentTime;
			this.swipe.lastPoint = this.swipe.currentPoint;
			this.swipe.currentPoint = point;
			this.swipe.currentTime = +new Date();
			this.swipe.deltaX = this.swipe.currentPoint.x - this.swipe.startPoint.x;
			this.swipe.deltaY = this.swipe.currentPoint.y - this.swipe.startPoint.y;
			this.swipe.curDeltaX = this.swipe.currentPoint.x - this.swipe.lastPoint.x;
			this.swipe.curDeltaY = this.swipe.currentPoint.y - this.swipe.lastPoint.y;
			this.swipe.velocity = T.utils.getVelocity(this.swipe.startPoint, this.swipe.currentPoint, this.swipe.startTime, this.swipe.currentTime);
			this.swipe.momentum = T.utils.getVelocity(this.swipe.lastPoint, this.swipe.currentPoint, this.swipe.lastTime, this.swipe.currentTime);
			this.swipe.angle = T.utils.getAngle(this.swipe.startPoint, this.swipe.currentPoint);
			this.swipe.direction = T.utils.getDirection(this.swipe.angle);
			this.swipe.elementDistance = this.swipe.direction === 'left' || this.swipe.direction === 'right' ? this.rect.width : this.rect.height;
			this.swipe.distance = this.swipe.direction === 'left' || this.swipe.direction === 'right' ? abs(this.swipe.deltaX) : abs(this.swipe.deltaY);
			this.swipe.percentage = this.swipe.distance / this.swipe.elementDistance * 100;
		};

		this.start = function ( event, data ) {
			if ( this.rAFId !== -1 ) {
				this.binder.end.call( this, event, data );
				window.cancelAnimationFrame( this.rAFId );
				this.rAFId = -1;
				T.preventGestures(this.gestureHandler);
				this.gestureHandler.cancelAllGestures( this );
			}
			this.rect = T.utils.getRect(this.gestureHandler.element);
			this.swipe = {
				inEndMomentum: false
			};

			this.countTouches = 0;
			if( !this.isValidMouseButton(event, this.options.which) ||
				this.hasMoreTouches(data.pagePoints)) {
				this.cancel();
				return;
			}

			this.swipe.startPoint = this.swipe.currentPoint = data.pagePoints[0];
			this.swipe.startTime = this.swipe.currentTime = +new Date();

			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.update = function(event, data) {
			if(this.hasMoreTouches(data.pagePoints)) {
				this.cancel();
				return;
			} else if(this.hasEqualTouches(data.pagePoints)) {
				this.setSwipe(data.pagePoints[0]);
				data.swipe = this.swipe;

				if(!this.started && this.swipe.startPoint.distanceTo(this.swipe.currentPoint) >= this.options.radiusThreshold) {
					this.gestureHandler.cancelGestures(this.type);
					this.started = true;
					this.binder.start.call(this, event, data);
				} else if(this.started) {
					this.binder.update.call(this, event, data);
				}

				this.swipe.startTime = this.swipe.currentTime; //to calculate correct velocity
			}

			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.end = function(event, data) {
			var p, m, that, dataPoint, keepOn, inertia = this.options.inertia;
			if(this.started) {
				if (this.options.useMomentum) {
					this.swipe.inEndMomentum = true;
					p = new T.Point(this.swipe.curDeltaX, this.swipe.curDeltaY).normalize();
					m = this.swipe.momentum;
					that = this;
					dataPoint = new T.Point(data.points[0].x, data.points[0].y);
					if(inertia >= 1) {
						inertia = this.defaults.inertia;
					}
					keepOn = function() {
						m *= inertia;
						if (that.swipe.inEndMomentum && m > 1) {
							dataPoint.x += p.x * m;
							dataPoint.y += p.y * m;
							data.pagePoints[0] = new T.Point(dataPoint.x, dataPoint.y);
							that.update(event, data);
							that.rAFId = window.requestAnimationFrame(keepOn);
						} else {
							that.rAFId = -1;
							that.binder.end.call(that, event, data);
						}
					};
					
					this.rAFId = window.requestAnimationFrame(keepOn);
				} else {
					this.binder.end.call(this, event, data);
				}
				
			}

			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.cancel = function() {
			if (this.rAFId !== -1) {
				this.binder.end.call(this, event, data);
				window.cancelAnimationFrame(this.rAFId);
				this.rAFId = -1;
				T.preventGestures(this.gestureHandler);
				this.gestureHandler.cancelAllGestures(this);
			}
			if(this.cancelled) {
				return;
			}
			this.cancelled = true;
			if(this.started) {
				this.binder.cancel.call(this);
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
