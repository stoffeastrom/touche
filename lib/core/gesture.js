(function(T) {
	'use strict';

	/**
	 * Represents a base gesture, never used on its own, it's used as a base for actual gestures.
	 * @name T.Gesture
	 * @class
	 * @param {DOMElement} elem The element to attach the gesture to
	 * @param {String} type The type of gesture
	 * @param {Object} gesture The internal data structure for the gesture
	 */
	T.Gesture = Object.augment(function () {
		this.on = T.utils.noop;
		this.off = T.utils.noop;
		this.start = T.utils.noop;
		this.update = T.utils.noop;
		this.end = T.utils.noop;
		this.cancel = function() {
			this.cancelled = true;
		};
		this.pause = function () {
			this.paused = true;
		};
		this.addPausedCallback = function(action, event, data) {
			this.pausedCallbacks.push({ action: action, event: event, data: data});
		};
		this.play = function(trigger) {
			if(trigger && !this.cancelled) {
				this.pausedCallbacks.forEach(function(obj) {
					this[obj.action].call(this, obj.event, obj.data);
				}, this);
			} else {
				this.gestureHandler.cancelGesture(this);
			}
			this.paused = false;
			this.pausedCallbacks = [];
		};
		this.setOptions = function () {
			Object.keys(this.defaults).forEach(function (key) {
				this.options[key] = (this.binder.options &&
				typeof this.binder.options[key] !== 'undefined') ?
				this.binder.options[key] :
				this.defaults[key];
			}, this);
		};
		/**
		 * Determine if an event has more touches than allowed.
		 * @name T.Gesture#hasMoreTouches
		 * @function
		 * @param {[Points]} points The points to evaluate
		 * @returns {Boolean} Whether the event has more touches than allowed
		 */
		this.hasMoreTouches = function(points) {
			this.countTouches = points.length > this.countTouches ? points.length : this.countTouches;
			return this.countTouches > 0 && this.countTouches > this.options.touches;
		};

		/**
		 * Determine if the event differs from the set number of touches allowed.
		 * @name T.Gesture#hasNotEqualTouches
		 * @function
		 * @param {[Points]} points The points to evaluate
		 * @returns {Boolean} Whether the event differs from the set number
		 */
		this.hasNotEqualTouches = function(points) {
			this.hasMoreTouches(points);
			return this.countTouches > 0 && this.countTouches !== this.options.touches;
		};

		/**
		 * Determine if the event's pressed button is valid
		 * @name T.Gesture#validMouseButton
		 * @function
		 * @param {Event} event The event object o evaluate
		 * @returns {Boolean} Whether the event had the allowedBtn or not, always true for touch/MSPointer
		 */
		this.isValidMouseButton = function(event, allowedBtn) {
			if(T.utils.touch) {
				return true;
			}
			if(T.utils.msPointer && event.pointerType != event.MSPOINTER_TYPE_MOUSE ) {
				return true;
			}
			var btn = event.button,
				which = event.which,
				actualBtn;
			actualBtn = (!which && btn !== undefined) ? ( btn & 1 ? 1 : ( btn & 2 ? 3 : ( btn & 4 ? 2 : 0 ) ) ) : which;
			return actualBtn === allowedBtn;
		};

		function Gesture(gestureHandler, type, binder) {
			this.gestureHandler = gestureHandler;
			this.type = type;
			this.binder = binder;
			this.started = false;
			this.cancelled = false;
			this.pausedCallbacks = [];
			this.paused = false;
			this.countTouches = 0;
			this.options = {};
			this.setOptions();
			this.sortKey = this.options.precedence || T.utils.getSortKey();
			this.id = this.binder.id;
		}
		return Gesture;
	});
})(window.Touche);
