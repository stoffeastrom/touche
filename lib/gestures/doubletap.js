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