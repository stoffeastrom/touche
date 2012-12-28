(function() {
	'use strict';

	var T = window.Touche,
		atan2 = Math.atan2,
		PI = Math.PI,
		sortExpando = 9;

	/**
	 * Namespace for common utility functions used by gesture modules.
	 * @namespace T.utils
	 */
	T.utils = {
		getSortKey: function() {
			return 5 * (++sortExpando);
		},
		/**
		 * Creates a {@link T.Rect} from a DOM element.
		 * @name T.getRect
		 * @param {DOMElement} target The element to create a rectangle from
		 * @returns {T.Rect} A rectangle with the position and dimension
		 */
		getRect: function(target) {
			return new T.Rect(target.offsetLeft, target.offsetTop, target.offsetWidth, target.offsetHeight);
		},
		/**
		* Determines if touch enabled
		*/
		touch: ('ontouchstart' in window),
		msPointer: (window.navigator.msPointerEnabled),

		getEvent: function(phase) {
			switch(phase) {
				case 'start':
					if(this.msPointer) {
						return 'MSPointerDown';
					} else if(this.touch) {
						return 'touchstart';
					} else {
						return 'mousedown';
					}
					break;
				case 'update':
					if(this.msPointer) {
						return 'MSPointerMove';
					} else if(this.touch) {
						return 'touchmove';
					} else {
						return 'mousemove';
					}
					break;
				case 'end':
					if(this.msPointer) {
						return 'MSPointerUp';
					} else if(this.touch) {
						return 'touchend';
					} else {
						return 'mouseup';
					}
					break;
				default: throw 'Not implemented!';
			}
		},

		/**
		* Gets which events that are used,
		* touchstart, touchmove, touchend or
		* mousedown, mousemove, mouseup or
		* MSPointerDown, MSPointerMove, MSPointerUp
		*/
		getEvents: function () {
			return {
				start: this.getEvent('start'),
				move: this.getEvent('update'),
				end: this.getEvent('end')
			};
		},

		/**
		 * Helper function for logging touch events.
		 * @name T.utils.logger
		 * @function
		 * @param {TouchEvent} event The event to log
		 * @param {String} touchList The array name to log (i.e. 'touches', 'changedTouces' etc.)
		 */
		logger: function(event, touchList) {
			if(!event.touches) {
				return;
			}

			touchList = event[touchList || 'touches'];

			var str = "",
				len = touchList.length;

			str += "touches: " + len;
			str += touchList.map(function(touch) {
				return "x:" + touch.pageX + ", " + touch.pageY;
			}).join(" ");

			window.console.log(str);
		},

		/**
		 * Used to determine if an object is a function.
		 * @name T.utils.isFunction
		 * @function
		 * @param {Function} f The object to test
		 * @returns {Boolean} Whether it is a function
		 */
		isFunction: function(f) {
			return Object.prototype.toString.call(f) === '[object Function]';
		},

		/**
		 * Used to determine if an object is an array.
		 * @name T.utils.isArray
		 * @function
		 * @param {Array} a The object to test
		 * @returns {Boolean} Whether it is an array
		 */
		isArray: function(a) {
			return Array.isArray(a);
		},

		/**
		 * Used to determine if an object is a plain object.
		 * @name T.utils.isObject
		 * @function
		 * @param {Object} o The object to test
		 * @returns {Boolean} Whether it is a plain object
		 */
		isObject: function(o) {
			return Object.prototype.toString.call(o) === '[object Object]';
		},

		/**
		 * Deep extend an object with another.
		 * @name T.utils.extend
		 * @function
		 * @param {Object} src1 Object to be extended
		 * @param {Object} src2 Object to extend with
		 * @returns {Object} The extended object (`src1`)
		 */
		extend: function(src1, src2) {
			var key, val, i;

			if(!src2) {
				return src1;
			}

			for (key in src2) {
				val = src2[key];
				if (this.isArray(val)) {
					src1[key] = this.isArray(src1[key]) ? src1[key] : [];
					for (i = 0; i < val.length; i++) {
						this.extend(src1[key][i], val[i]);
					}
				} else if (this.isFunction(val)) {
					// we probably need something better here,
					// but it works for normal usecases
					/*jshint loopfunc: true*/
					(function() {
						var fn = val;
						src1[key] = function() {
							fn.apply(this, arguments);
						};
					})();
				} else if (this.isObject(val)) {
					this.extend((src1[key] = src1[key] || {}), val);
				} else {
					// assume we can reuse the value straight up
					src1[key] = src2[key];
				}
			}

			return src1;
		},

		/**
		 * Get the angle between two points.
		 * @name T.utils.getAngle
		 * @function
		 * @param {T.Point} startPoint The starting point (startPoint.x, startPoint.y)
		 * @param {T.Point} currentPoint The end point (currentPoint.x, currentPoint.y)
		 * @returns {Number} The angle between the points
		 */
		getAngle: function(startPoint, currentPoint) {
			var x = startPoint.x - currentPoint.x,
				y = startPoint.y - currentPoint.y,
				theta = atan2(y, x),
				degrees = theta * 180 / PI;
			degrees = degrees < 0 ? 360 + degrees : degrees;
			return degrees;
		},

		/**
		 * Get the delta angle between two points by removing `currentPoint` from `startPoint`.
		 * @name T.utils.getDeltaAngle
		 * @function
		 * @param {T.Point} startPoint The starting point (startPoint.x, startPoint.y)
		 * @param {T.Point} currentPoint The end point (currentPoint.x, currentPoint.y)
		 * @returns {Number} The delta angle between the points
		 */
		getDeltaAngle: function(startPoint, currentPoint) {
			var x = currentPoint.x - startPoint.x,
				y = currentPoint.y - startPoint.y,
				theta = atan2(y, x),
				degrees = theta * 180 / PI;
			return degrees;
		},

		/**
		 * Get the direction based on degrees.
		 * @name T.utils.getDirection
		 * @function
		 * @param {Number} degrees The degrees to evaluate
		 * @returns {String} A string description of the direction ('left', 'right', 'up', 'down'),
		 *                   returns 'invalid' if the degree is under 0 or over 360
		 */
		getDirection: function(degrees) {
			var direction = 'invalid';
			if (degrees >= 0 && degrees < 45 || degrees >= 315 && degrees <= 360) {
				direction = 'right';
			} else if (degrees >= 45 && degrees < 135) {
				direction = 'down';
			} else if (degrees >= 135 && degrees < 225) {
				direction = 'left';
			} else if (degrees >= 225 && degrees < 315) {
				direction = 'up';
			}
			return direction;
		},

		/**
		 * Get the velocity using two points.
		 * @name T.utils.getVelocity
		 * @function
		 * @param {T.Point} startPoint The starting point (startPoint.x, startPoint.y)
		 * @param {T.Point} currentPoint The end point (currentPoint.x, currentPoint.y)
		 * @param {Number} startTime The start time
		 * @param {Number} currentTime The end time
		 * @returns {Number} The velocity
		 */
		getVelocity: function(startPoint, currentPoint, startTime, currentTime) {
			var dist = startPoint.distanceTo(currentPoint),
				timeElapsed = currentTime - startTime;
			return dist / timeElapsed;
		},

		/**
		 * Validates a property
		 * @name T.utils.validateProperty
		 * @function
		 * @param {String} operator, supported are 'EQ', 'NE', 'GT', 'GE', 'LT', 'LE'
		 * @param {Number, String} property value
		 * @param {Number, String} value to compare with
		 */
		validateProperty: function(operator, propertyValue, value) {
			switch(operator) {
				case 'EQ': return propertyValue === value;
				case 'NE': return propertyValue !== value;
				case 'GT': return propertyValue > value;
				case 'GE': return propertyValue >= value;
				case 'LT': return propertyValue < value;
				case 'LE': return propertyValue <= value;
				default: throw 'Operator: ' + operator + ' not implemented!';
			}
		},

		/**
		 * Validates properties on an object (e.g gesture)
		 * @name T.utils.validateProperties
		 * @function
		 * @param {Object} object (e.g gesture)
		 * @param {Properties} Properties to validate ex. { type: 'tap', operator: 'EQ' }
		 */
		validateProperties: function(obj, props) {
			var key, prop;

			if(this.isObject(obj)) {
				for(key in obj) {
					prop = props[key];
					if(!prop) {
						continue;
					}
					if(!this.validateProperty(prop.operator, obj[key], prop.value)) {
						return false;
					}
				}
				return true;
			}
			return false;
		}
	};
})();