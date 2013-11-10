(function(T, sqrt) {
	'use strict';

	/**
	 * Represents a coordinate/point.
	 * @name T.Point
	 * @class
	 * @param {Number} x
	 * @param {Number} y
	 */
	T.Point = function(x, y) {
		this.x = x;
		this.y = y;
	};

	/**
	 * Get the distance between this point and another.
	 * @name T.Point#distanceTo
	 * @function
	 * @param {T.Point} point The target point
	 * @returns {Number} The distance between the points
	 */
	T.Point.prototype.distanceTo = function(point) {
		var xdist = this.x - point.x,
			ydist = this.y - point.y,
			dist = sqrt(xdist * xdist + ydist * ydist);

		return dist;
	};

	/**
	 * Normalize point's x and y values so that the absolute value is 1
	 * @name T.Point#normalize
	 * @function
	 * @returns {Point} A normalized Point
	 */
	T.Point.prototype.normalize = function() {
		var dist = sqrt(this.x * this.x + this.y * this.y),
			x = this.x / dist,
			y = this.y / dist;

		return new T.Point(x, y);
	};
})(window.Touche, Math.sqrt);