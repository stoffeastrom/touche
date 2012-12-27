(function() {
	'use strict';

	var T = window.Touche;

	/**
	 * Bind a doubletap event, used for basic interaction. Supports an area threshold for easier interaction
	 * on mobile devices. Triggers `start`, `update` and `end` events.
	 * @name T.gestures.doubletap
	 * @function
	 * @param {DOMElement} elem The element to bind the gesture to
	 * @param {Object} gesture Data to set up the gesture
	 */
	T.add('doubletap', {
		options: {
			areaThreshold: 5,
			timeThreshold: 400,
			touches: 1,
			precedence: 4,
			preventDefault: true
		},
		init: function(elem) {
			this.count = 0;
			T(elem).tap({
				options: this.options,
				end: this.end
			});
		},
		end: function(event, data) {
			var self = this;
			++this.count;
			if(this.count === 1) {
				this.startTime = +new Date();
				this.context.pause('tap', this);
				this.timerId = setTimeout(function() {
					self.context.play(true);
					self.count = 0;
				}, this.options.timeThreshold + 5);
			} else if(this.count === 2) {
				window.clearTimeout(this.timerId);
				this.endTime = +new Date();
				if((this.startTime + this.options.timeThreshold) >= this.endTime) {
					this.context.play();
					this.bindingObj.end.call(this, event, data);
				}
				this.count = 0;
			}

			if(this.preventDefault) {
				event.preventDefault();
			}
		},
		cancel: function() {
			window.clearTimeout(this.timerId);
			this.bindingObj.cancel.call(this.bindingObj);
		}
	});
})();