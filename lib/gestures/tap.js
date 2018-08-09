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
			this.rect = T.utils.getRect(this.gestureHandler.element);
			if( !this.isValidMouseButton(event, this.options.which) ||
				this.hasMoreTouches(data.pagePoints)) {
				this.cancel();
				return;
			}

			this.binder.start.call(this, event, data);
			
			if(this.options.preventDefault) {
				event.preventDefault();
				T.WebkitHack.prevent();
			}
		};

		this.update = function(event, data) {
			if(!this.started) {
				return;
			}
			if(this.hasMoreTouches(data.pagePoints) ||
				!this.rect.pointInside(data.pagePoints[0], this.options.areaThreshold)) {
				this.cancel();
				return;
			}

			if(this.options.preventDefault) {
				event.preventDefault();
				T.WebkitHack.prevent();
			}
		};

		this.end = function(event, data) {
			if(!this.started) {
				return;
			}
			if(this.hasNotEqualTouches(data.pagePoints)) {
				return;
			}
			if(this.rect.pointInside(data.pagePoints[0], this.options.areaThreshold)) {
				this.gestureHandler.cancelGestures(this.type);
				this.binder.end.call(this, event, data);
			}
			if(this.options.preventDefault) {
				event.preventDefault();
				T.WebkitHack.prevent();
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
