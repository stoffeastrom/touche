(function() {
	'use strict';

	var T,
		abs = Math.abs,
		sqrt = Math.sqrt,
		pow = Math.pow,
		atan2 = Math.atan2,
		PI = Math.PI,
		sortExpando = 9,
		getSortKey = function() {
			return 5 * (++sortExpando);
		},
		doc = window.document;

	/**
	 * `window.Touche` is the globally exposed function used to interact with the Touché library.
	 * @name Touche
	 * @constructor
	 * @namespace T
	 */
	T = window.Touche = function(elem) {
		if (typeof elem === "undefined") {
			throw new Error("No element sent into Touche()");
		}
		if (!(this instanceof T)) {
			return new T(elem);
		}
		this.elem = elem;
		this.cache = T.cache.get(elem);
	};

	/**
	 * Internal cache of all defined (raw) gestures.
	 * @private
	 * @type {Object}
	 */
	T._gestures = {};

	/**
	 * Add a gesture to Touché.
	 * @name T.add
	 * @function
	 * @param {String} name The publicly used name for the gesture
	 * @param {T.Gesture} gesture The gesture definition
	 */
	T.add = function(name, gesture) {
		T._gestures[name] = gesture;
		T.prototype[name] = function() {
			gesture.apply(this, [this.elem].concat(Array.apply(null, arguments)));
			return this;
		};
	};

	/**
	 * Get the raw object behind a gesture.
	 * @name T.get
	 * @function
	 * @param {String} name The gesture to retrieve
	 * @returns {T.Gesture|undefined} The gesture definition
	 */
	T.get = function(name) {
		return T._gestures[name];
	};

	/**
	 * Virtual namespace for gestures, only used for documentation.
	 * @namespace T.gestures
	 */

	/**
	 * Namespace for common utility functions used by gesture modules.
	 * @namespace T.utils
	 */
	T.utils = {
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
		var xdist = abs(this.x - point.x),
			ydist = abs(this.y - point.y),
			dist = sqrt(pow(xdist, 2) + pow(ydist, 2));

		return dist;
	};

	/**
	 * Represents a rectangle.
	 * @name T.Rect
	 * @class
	 * @param {Number} x Horizontal pixel position
	 * @param {Number} y Vertical pixel position
	 * @param {Number} width The width of the rectangle
	 * @param {Number} height The height of the rectangle
	 */
	T.Rect = function(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	};

	/**
	 * Determine if a point is inside this rectangle using an optional threshold.
	 * @name T.Rect#pointInside
	 * @function
	 * @param {T.Point} point The point to evaluate
	 * @param {Number} threshold (Optional) The pixel threshold
	 * @returns {Boolean} Whether the point is inside the rectangle
	 */
	T.Rect.prototype.pointInside = function(point, threshold) {
		threshold = threshold || 0;
		var minX = this.x - threshold,
			minY = this.y - threshold,
			maxX = this.x + this.width + threshold,
			maxY = this.y + this.height + threshold;

		return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
	};

	/**
	 * Creates a {@link T.Rect} from a DOM element.
	 * @name T.getRect
	 * @param {DOMElement} target The element to create a rectangle from
	 * @returns {T.Rect} A rectangle with the position and dimension
	 */
	T.getRect = function(target) {
		return new T.Rect(target.offsetLeft, target.offsetTop, target.offsetWidth, target.offsetHeight);
	};

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
		return cache.length === 0 ? this.data[this.data.push({ elem: elem, context: new T.GestureController(elem) }) -1] : cache[0];
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

	/**
	 * Represents a controller for gestures, used to set up basic structure for creating gestures.
	 * @name T.GestureController
	 * @todo Move this into its own file? It's kind of large.
	 * @class
	 * @param {DOMElement} element The element attached to the {@link T.GestureController}
	 */
	T.GestureController = function(element) {
		this.element = element;
		this.gestures = [];
		this.sortedGestures = [];
		this.data = {};
		this.data.points = [];
		this.pausedCallbacks = [];
	};

	T.GestureController.prototype.activate = function() {
		this.on(this.element, T.utils.getEvents().start);
	};

	T.GestureController.prototype.deactivate = function() {
		this.off(this.element, T.utils.getEvents().start);
		this.bindDoc(false);
		T.cache.remove(this.element);
	};

	T.GestureController.prototype.on = function(element, event) {
		if(T.utils.msPointer) {
			if(element.style && element.style.msTouchAction) {
				this.msTouchAction = element.style.msTouchAction;
			} else if (!element.style) {
				element.style = '';
			}
			element.style.msTouchAction = 'none';
		}
		element.addEventListener(event, this, false);
	};

	T.GestureController.prototype.off = function(element, event) {
		element.removeEventListener(event, this, false);
		if(T.utils.msPointer) {
			if(element.style) {
				element.style.msTouchAction = this.msTouchAction;
			}
		}
	};

	T.GestureController.prototype.reset = function() {
		this.gestures.forEach(function(gesture) {
			gesture.cancelled = false;
			gesture.countTouches = 0;
		});
	};

	T.GestureController.prototype.trigger = function(action, event, data) {
		var gesture;
		this.sortedGestures.forEach(function(sorted) {
			gesture = sorted.context;
			if(gesture.paused && T.utils.isFunction(gesture[action]) && !gesture.cancelled) {
				this.addPausedCallback(gesture, action, event, data);
			} else if(T.utils.isFunction(gesture[action]) && !gesture.cancelled) {
				gesture[action].call(gesture, event, data);
			}
		}, this);
	};

	T.GestureController.prototype.play = function(trigger) {
		trigger = trigger || false;

		this.pausedCallbacks.forEach(function(obj) {
			if(trigger) {
				obj.gesture[obj.action].call(obj.gesture, obj.event, obj.data);
			} else {
				this.cancelGesture(obj.gesture);
			}
		}, this);
		this.gestures.filter(function(obj) {
			return obj.paused === true;
		}).forEach(function(obj) {
			obj.paused = false;
		});
		this.pausedCallbacks = [];
	};

	T.GestureController.prototype.pause = function(type, excludeGesture) {
		this.gestures.filter(function(gesture) {
			return excludeGesture !== gesture && type === gesture.type;
		}).forEach(function(gesture) {
			gesture.pause();
			gesture.paused = true;
		});
	};

	T.GestureController.prototype.addPausedCallback = function(gesture, action, event, data) {
		this.pausedCallbacks.push({
			gesture: gesture,
			action: action,
			event: event,
			data: data
		});
	};

	T.GestureController.prototype.addGesture = function(gesture) {
		this.gestures.push(gesture);
		this.sortGestures();

		if(this.gestures.length === 1) {
			this.activate();
		}
	};

	T.GestureController.prototype.removeGesture = function(gesture) {
		this.gestures = this.gestures.filter(function(obj) {
			return obj !== gesture;
		});
		this.sortGestures();

		if(this.gestures.length === 0) {
			this.deactivate();
		}
	};

	T.GestureController.prototype.removeGestures = function(type) {
		this.gestures.filter(function(obj) {
			return obj.type === type;
		}).forEach(function(gesture) {
			this.removeGesture(gesture);
		}, this);
	};

	T.GestureController.prototype.cancelGesture = function(gesture) {
		if(!gesture.cancelled) {
			gesture.cancelled = true;
			gesture.cancel.call(gesture);
		}
	};

	T.GestureController.prototype.cancelGestures = function(type) {
		this.gestures.filter(function(obj) {
			return obj.type === type;
		}).forEach(function(gesture) {
			this.cancelGesture(gesture);
		}, this);
		return this;
	};

	T.GestureController.prototype.cancelGesturesWithProps = function(props, excludeGesture) {
		this.gestures.filter(function(obj) {
			if(excludeGesture &&
				excludeGesture === obj) {
				return false;
			}
			return T.utils.validateProperties(obj, props);
		}).forEach(function(gesture) {
			this.cancelGesture(gesture);
		}, this);
	};

	T.GestureController.prototype.sortGestures = function() {
		var sorted = [],
			key;

		for(key in this.gestures) {
			if(this.gestures.hasOwnProperty(key)) {
				sorted.push({
					key: this.gestures[key].sortKey,
					context: this.gestures[key]
				});
			}
		}
		sorted.sort(function(g1, g2) {
			return g1.key - g2.key;
		});

		this.sortedGestures = sorted;
	};

	T.GestureController.prototype.bindDoc = function(on) {
		this[on ? 'on' : 'off'](doc, T.utils.getEvents().move);
		this[on ? 'on' : 'off'](doc, T.utils.getEvents().end);
	};

	T.GestureController.prototype.handleEvent = function(event) {
		var events = T.utils.getEvents();

		switch(event.type) {
		case events.start:
			this.bindDoc(true);
			this.setPoints(event);
			this.trigger('start', event, this.data);
			break;
		case events.move:
			this.setPoints(event);
			this.trigger('update', event, this.data);
			break;
		case events.end:
			this.bindDoc(false);
			this.setPoints(event, 'changedTouches');
			this.trigger('end', event, this.data);
			this.reset();
			break;
		}
	};

	T.GestureController.prototype.setPoints = function(event, touchList) {
		touchList = touchList || 'touches';

		var i, len, touches;

		if(T.utils.touch) {
			touches = event[touchList];
			len = touches.length;
			for(i = 0; i < len; ++i) {
				this.data.points.length = len;
				this.data.points[i] = new T.Point(touches[i].pageX, touches[i].pageY);
			}
		} else {
			this.data.points.length = 1;
			this.data.points[0] = new T.Point(event.pageX, event.pageY);
		}
	};

	/**
	 * Represents a base gesture, never used on its own, it's used as a base for actual gestures.
	 * @name T.Gesture
	 * @class
	 * @param {DOMElement} elem The element to attach the gesture to
	 * @param {String} type The type of gesture
	 * @param {Object} gesture The internal data structure for the gesture
	 */
	T.Gesture = function(elem, type, touches) {
		this.elem = elem;
		this.rect = T.getRect(elem);
		this.type = type;
		this.cancelled = false;
		this.paused = false;
		this.touches = touches;
		this.countTouches = 0;
	};

	/**
	 * Determine if an event has more touches than allowed.
	 * @name T.Gesture#hasMoreTouches
	 * @function
	 * @param {Event} event The event to evaluate
	 * @param {String} touchList The name of the touch list (i.e. 'touches', 'changedTouces' etc.)
	 * @returns {Boolean} Whether the event has more touches than allowed
	 */
	T.Gesture.prototype.hasMoreTouches = function(event, touchList) {
		touchList = touchList || 'touches';
		this.countTouches = event[touchList] && event[touchList].length > this.countTouches ? event[touchList].length : (this.countTouches || 1);
		return this.countTouches > 0 && this.countTouches > this.touches;
	};

	/**
	 * Determine if the event differs from the set number of touches allowed.
	 * @name T.Gesture#hasNotEqualTouches
	 * @function
	 * @param {Event} event The event to evaluate
	 * @param {String} touchList The name of the touch list (i.e. 'touches', 'changedTouces' etc.)
	 * @returns {Boolean} Whether the event differs from the set number
	 */
	T.Gesture.prototype.hasNotEqualTouches = function(event, touchList) {
		this.hasMoreTouches(event, touchList);
		return this.countTouches > 0 && this.countTouches !== this.touches;
	};

	T.gesture = function(elem, type, gesture) {
		var g = new T.Gesture(elem, type, gesture.options.touches);
		g.start = function() {};
		g.update = function() {};
		g.end = function() {};
		g.cancel = function() {};
		g.play = function() {};
		g.pause = function() {};
		g.sortKey = gesture.options.precedence || getSortKey();
		T.utils.extend(g, gesture);
		return g;
	};
})();