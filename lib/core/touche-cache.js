(function() {
	'use strict';

	var T = window.Touche;

	/**
	 * Represents a cache, used to store data separate from a DOM element.
	 * @name T.Cache
	 * @class
	 */
	T.Cache = function() {
		this.data = [];
	};

	/**
	 * Get data associated to an element.
	 * @name T.Cache#get
	 * @function
	 * @param {DOMElement} elem The target element
	 * @returns {T.GestureController} The gesture controller for `elem`
	 */
	T.Cache.prototype.get = function(elem) {
		var cache = this.data.filter(function(obj) {
			return obj.elem === elem;
		});
		return cache.length === 0 ? this.data[this.data.push({ elem: elem, context: new T.GestureHandler(elem) }) -1] : cache[0];
	};

	/**
	 * Removes the data associated to an element.
	 * @name T.Cache#remove
	 * @function
	 * @param {DOMElement} elem The target element
	 */
	T.Cache.prototype.remove = function(elem) {
		var cache = this.get(elem),
			index;

		if(cache) {
			index = this.data.indexOf(cache);
			this.data.splice(index, 1);
		}
	};

	T.cache = new T.Cache();
})();