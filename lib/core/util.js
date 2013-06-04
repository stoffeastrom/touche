(function(T, atan2, PI) {
	'use strict';

	var sortExpando = 9;

	/**
	 * Namespace for common utility functions used by gesture modules.
	 * @namespace T.utils
	 */
	T.utils = {
		noop: function() {},
		getSortKey: function() {
			return 5 * (++sortExpando);
		},
		/**
		 * Checks if an element is any SVG
		 * @name T.utils.isSVG
		 * @param {DOMElement} el The element to check
		 * @returns {Boolean} true if SVG
		 */
		isSVG: function(el) {
			return el.nodeType === 1 && el.namespaceURI === 'http://www.w3.org/2000/svg';
		},
		/**
		 * Gets the closest element that matches the tagToMatch
		 * @name T.utils.closest
		 * @param {DOMElement} currentEl The element to start matching from
		 * @param {String} el tagToMatch tag to match i.e 'svg', 'div'
		 * @returns {DOMElement} if found else null
		 */
		closest: function(currentEl, tagToMatch) {
			var isEq = function(tag1, tag2) {
					return tag1.toUpperCase() === tag2.toUpperCase();
				},
				parent = currentEl.parentNode;
			if(!parent) {
				return null;
			}
			if(isEq(currentEl.tagName, tagToMatch)){
				return currentEl;
			}
			if(isEq(parent.tagName, tagToMatch)) {
				return parent;
			}
			while(parent) {
				parent = parent.parentNode;
				if(isEq(parent.tagName, tagToMatch)) {
					return parent;
				}
			}
			return null;
		},

		/**
		 * Transforms a point if needed
		 * @name T.utils.transformPoint
		 * @param {DOMElement} cl The current target
		 * @param {@Link T.Point} point The current @Link T.Point
		 * @returns {@Link T.Point} The transformed @Link T.Point
		 */
		transformPoint: function(el, point) {
			var svg, svgPoint;

			if(T.utils.isSVG(el)) {
				svg = T.utils.closest(el, 'svg');
				if(svg) {
					svgPoint = svg.createSVGPoint();
					svgPoint.x = point.x;
					svgPoint.y = point.y;
					svgPoint = svgPoint.matrixTransform(el.getScreenCTM().inverse());
					return new T.Point(svgPoint.x, svgPoint.y);
				}
			}
			return point;
		},
		/**
		 * Creates a {@link T.Rect} from a DOM element.
		 * @name T.getRect
		 * @param {DOMElement} target The element to create a rectangle from
		 * @returns {T.Rect} A rectangle with the position and dimension
		 */
		getRect: function(target) {
			var bbox, win = window, doc = win.document, body = doc.body, elem, fn;
			if(T.utils.isSVG(target)){
				fn = (target.getBBox || target.getBoundingClientRect);
				bbox = fn.call(target);
				return new T.Rect(((bbox.x || bbox.left || 0) + (win.scrollX || doc.documentElement.scrollLeft)),
					((bbox.y || bbox.top || 0) + (win.scrollY || doc.documentElement.scrollTop)),
					bbox.width,
					bbox.height);
			} else {
				elem = (win === target || doc === target || (!target.getBoundingClientRect)) ? body : target;
				bbox = elem.getBoundingClientRect();
				return new T.Rect(bbox.left + (win.scrollX || doc.documentElement.scrollLeft),
					bbox.top + (win.scrollY || doc.documentElement.scrollTop),
					bbox.width,
					bbox.height);
			}
		},
		/**
		* Determines if touch enabled
		*/
		touch: ('ontouchstart' in window),
		msPointer: (window.navigator.msPointerEnabled),

		getFlowType: function(event) {
			switch(event) {
				case 'mousedown':
				case 'mousemove':
				case 'mouseup':
					return 'mouse';
				case 'touchstart':
				case 'touchmove':
				case 'touchend':
				case 'touchcancel':
					return 'touch';
				case 'MSPointerDown':
				case 'MSPointerMove':
				case 'MSPointerUp':
				case 'MSPointerCancel':
					return 'MSPointer';
				case 'pointerdown':
				case 'pointermove':
				case 'pointerup':
				case 'pointercancel':
					return 'pointer';
				default: throw 'Not implemented!';
			}
		},

		getFlowTypes: function(event) {
			switch(event) {
				case 'mousedown':     return ['mouse'];
				case 'touchstart':    return ['touch'];
				case 'MSPointerDown': return ['MSPointer'];
				case 'pointerdown':   return ['pointer'];
				default: return ['mouse', 'touch', 'MSPointer', 'pointer'];
			}
		},

		getEvent: function(phase, type) {
			switch(phase) {
				case 'update':
					switch(type) {
						case 'mouse':     return 'mousemove';
						case 'touch':     return 'touchmove';
						case 'MSPointer': return 'MSPointerMove';
						case 'pointer':   return 'pointermove';
					}
					break;
				case 'end':
					switch(type) {
						case 'mouse':     return 'mouseup';
						case 'touch':     return 'touchend';
						case 'MSPointer': return 'MSPointerUp';
						case 'pointer':   return 'pointerup';
					}
					break;
				case 'cancel':
					switch(type) {
						case 'touch':     return 'touchcancel';
						case 'MSPointer': return 'MSPointerCancel';
						case 'pointer':   return 'pointercancel';
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
				start: ['mousedown', 'touchstart', 'MSPointerDown', 'pointerdown'],
				update: ['mousemove', 'touchmove', 'MSPointerMove', 'pointermove'],
				end: ['mouseup', 'touchend', 'MSPointerUp', 'pointerup'],
				cancel: ['touchcancel', 'MSPointerCancel', 'pointercancel']
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
		}
	};
})(window.Touche, Math.atan2, Math.PI);
