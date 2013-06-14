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
			preventDefault: true,
			which: 1
		};

		this.on = function(elem) {
			this.count = 0;
			T(elem).on('tap', {
				areaThreshold: this.options.areaThreshold,
				preventDefault: this.options.preventDefault,
				touches: this.options.touches,
				which: this.options.which,
				id: this.id,
				end: this.end
			});
		};

		this.off = function(elem) {
			T(elem).off('tap', this.id);
		};

		this.end = function(event, data) {
			if(!this.isValidMouseButton(event, this.options.which)) {
				this.cancel();
				return;
			}

			var instance = this;
			++instance.count;
			if(instance.count === 1) {
				instance.startTime = +new Date();
				instance.gestureHandler.pause(null, this);
				instance.timerId = setTimeout(function() {
					instance.gestureHandler.play(true);
					instance.count = 0;
				}, instance.options.timeThreshold + 5);
			} else if(instance.count === 2) {
				window.clearTimeout(instance.timerId);
				instance.endTime = +new Date();
				if((instance.startTime + instance.options.timeThreshold) >= instance.endTime) {
					instance.gestureHandler.play();
					instance.binder.end.call(instance, event, data);
				}
				instance.count = 0;
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