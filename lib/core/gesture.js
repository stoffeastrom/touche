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
		this.elem = elem;
		this.type = type;
		this.bindingObj = bindingObj;
		this.options = this.bindingObj.options;
		this.rect = T.getRect(elem);
		this.cancelled = false;
		this.paused = false;
		this.sortKey = bindingObj.options.precedence || T.utils.getSortKey();
		this.countTouches = 0;
		this.touches = bindingObj.options.touches;
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
	T.Gesture.prototype.init = function() {};
	T.Gesture.prototype.start = function() {};
	T.Gesture.prototype.update = function() {};
	T.Gesture.prototype.end = function() {};
	T.Gesture.prototype.cancel = function() {};
	T.Gesture.prototype.play = function() {};
	T.Gesture.prototype.pause = function() {};
})();