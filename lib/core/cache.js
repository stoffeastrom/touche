(function(T) {
	'use strict';

	/**
	 * Represents a cache, used to store data separate from a DOM element.
	 * @name T.Cache
	 * @class
	 */
	T.cache = {
		data: [],
		/**
		 * Has the element been added to the cache?.
		 * @name T.Cache#has
		 * @function
		 * @param {DOMElement} elem The target element
		 * @returns {Array} Array The filter array for the element
		 */
		has: function(elem) {
			return this.data.filter(function (obj) {
				return obj.elem === elem;
			});
		},
		/**
		 * Get data associated to an element.
		 * @name T.Cache#get
		 * @function
		 * @param {DOMElement} elem The target element
		 * @returns {T.GestureHandler} The gesture handler for `elem`
		 */
		get: function (elem) {
			var cache = this.has(elem);
			return cache.length === 0 ? this.data[this.data.push({
					elem: elem,
					context: new T.GestureHandler(elem)
				}) - 1].context :
				cache[0].context;
		},
		/**
		 * Removes the data associated to an element.
		 * @name T.Cache#remove
		 * @function
		 * @param {DOMElement} elem The target element
		 */
		remove: function (elem) {
			var cache = this.has(elem),
				index;

			if (cache.length) {
				index = this.data.indexOf(cache[0]);
				this.data.splice(index, 1);
			}
		}
	};
})(window.Touche);