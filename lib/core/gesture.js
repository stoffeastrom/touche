(function() {
	'use strict';

	var T = window.Touche;

	/**
	 * Represents a base gesture, never used on its own, it's used as a base for actual gestures.
	 * @name T.Gesture
	 * @class
	 * @param {DOMElement} elem The element to attach the gesture to
	 * @param {String} type The type of gesture
	 * @param {Object} gesture The internal data structure for the gesture
	 */
	T.Gesture = function(context, elem, type, bindingObj) {
		this.context = context;
		this.type = type;
		this.bindingObj = bindingObj;
		this.options = this.bindingObj.options;
		this.started = false;
		this.cancelled = false;
		this.paused = false;
		this.sortKey = bindingObj.options.precedence || T.utils.getSortKey();
		this.countTouches = 0;
		this.touches = bindingObj.options.touches;
		this.preventDefault = bindingObj.options.preventDefault;
	};

	/**
	 * Determine if an event has more touches than allowed.
	 * @name T.Gesture#hasMoreTouches
	 * @function
	 * @param {[Points]} points The points to evaluate
	 * @returns {Boolean} Whether the event has more touches than allowed
	 */
	T.Gesture.prototype.hasMoreTouches = function(points) {
		this.countTouches = points.length > this.countTouches ? points.length : this.countTouches;
		return this.countTouches > 0 && this.countTouches > this.touches;
	};

	/**
	 * Determine if the event differs from the set number of touches allowed.
	 * @name T.Gesture#hasNotEqualTouches
	 * @function
	 * @param {[Points]} points The points to evaluate
	 * @returns {Boolean} Whether the event differs from the set number
	 */
	T.Gesture.prototype.hasNotEqualTouches = function(points) {
		this.hasMoreTouches(points);
		return this.countTouches > 0 && this.countTouches !== this.touches;
	};

	/**
	 * Determine if the event's pressed button is valid
	 * @name T.Gesture#validMouseButton
	 * @function
	 * @param {Event} event The event object o evaluate
	 * @returns {Boolean} Whether the event had the allowedBtn or not, always true for touch/MSPointer
	 */
	T.Gesture.prototype.isValidMouseButton = function(event, allowedBtn) {
		if(T.utils.touch) {
			return true;
		}
		if(T.utils.msPointer) {
			return true;
		}
		var btn = event.button,
			which = event.which,
			actualBtn;
		actualBtn = (!which && btn !== undefined) ? ( btn & 1 ? 1 : ( btn & 2 ? 3 : ( btn & 4 ? 2 : 0 ) ) ) : which;
		return actualBtn === allowedBtn;
	};
	T.Gesture.prototype.on = function() {};
	T.Gesture.prototype.off = function() {};
	T.Gesture.prototype.start = function() {};
	T.Gesture.prototype.update = function() {};
	T.Gesture.prototype.end = function() {};
	T.Gesture.prototype.cancel = function() {};
	T.Gesture.prototype.play = function() {};
	T.Gesture.prototype.pause = function() {};
})();