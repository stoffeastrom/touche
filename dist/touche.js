/*! Touché - v1.0.8 - 2013-06-04
* https://github.com/stoffeastrom/touche/
* Copyright (c) 2013 Christoffer Åström, Andrée Hansson; Licensed MIT */
(function (fnProto) {
	'use strict';
	fnProto.augment = function (classFn) {
		var _super = this.prototype,
			prototype = Object.create(_super),
			constructor = classFn.call(prototype, this, _super);
		if (typeof constructor !== 'function') {
			constructor = function () {};
		}
		prototype.constructor = constructor;
		constructor.prototype = prototype;
		return constructor;
	};
})(Function.prototype);
(function() {
	'use strict';

	var T;

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
		this.gestureHandler = T.cache.get(elem);
	};

	T.prototype.on = function(type, binder) {
		T.prototype[type].call(this, binder);
		return this;
	};
	
	T.prototype.off = function(type, id) {
		this.gestureHandler.gestures.filter(function(gesture) {
			return (type && type !== '*' && id) ?
						(gesture.type === type && gesture.id === id) :
						(type && type === '*' && id) ?
							(gesture.id === id) :
							type ?
								(gesture.type === type) :
								true;
		}).forEach(function(gesture) {
			gesture.off(this.elem);
			this.gestureHandler.removeGesture(gesture);
		}, this);
		if(this.gestureHandler.gestures.length === 0 && T.cache.data.length === 1) { //.off() was called without binding, make sure to clean up
			T.cache.remove(this.elem);
		}
		return this;
	};
	/**
	 * Internal cache of all defined (raw) gestures.
	 * @private
	 * @type {Object}
	 */
	T._gestures = {};

	/**
	 * Namespace for gestures.
	 * @namespace T.gestures
	 */
	T.gestures = {
		/**
		 * Add a gesture to Touché.
		 * @name T.add
		 * @function
		 * @param {String} name The publicly used name for the gesture
		 * @param {T.Gesture} gesture The gesture definition
		 */
		add: function(type, Gesture) {
			T._gestures[type] = Gesture;
			T.prototype[type] = function(binder) {
				var gestureInst,
					binderInst = new T.Binder(binder);
				gestureInst = new Gesture(this.gestureHandler, type, binderInst);
				this.gestureHandler.addGesture(gestureInst);
				gestureInst.on(this.elem);
				return this;
			};
		},
		get: function(type) {
			return T._gestures[type];
		},
		remove: function(type) {
			if(T._gestures[type]) {
				T.cache.data.forEach(function(obj) {
					obj.context.gestures.filter(function(gesture) {
						return gesture.type === type;
					}).forEach(function(gesture) {
						obj.context.removeGesture(gesture);
					});
				});
				delete T.prototype[type];
				delete T._gestures[type];
			}
		}
	};
})();
(function(T, doc){
	'use strict';

	/**
	* Bind dragstart event to make sure we cancel all active gestures,
	* since a native drag gesture is not compatible with Touché.
	*/
	document.addEventListener("dragstart", function() {
		T.cache.data.forEach(function(obj) {
			obj.context.cancelAllGestures();
		});
	}, false);

	/**
	 * Represents a handler for gestures, used to set up basic structure for creating gestures.
	 * @name T.GestureHandler
	 * @class
	 * @param {DOMElement} element The element attached to the {@link T.GestureHandler}
	 */
	T.GestureHandler = Object.augment(function() {

		this.activate = function() {
			T.utils.getEvents().start.forEach(function(event) {
				this.on(this.element, event);
			}, this);
		};

		this.deactivate = function() {
			T.utils.getEvents().start.forEach(function(event) {
				this.off(this.element, event);
			}, this);
			this.bindDoc(false);
			T.cache.remove(this.element);
		};

		this.on = function(element, event) {
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

		this.off = function(element, event) {
			element.removeEventListener(event, this, false);
			if(T.utils.msPointer) {
				if(element.style) {
					element.style.msTouchAction = this.msTouchAction;
				}
			}
		};

		this.reset = function(flowType) {
			this.gestures.forEach(function(gesture) {
				gesture.started = false;
				gesture.cancelled = false;
				gesture.countTouches = 0;
			});

			this.data[flowType] = {};
			this.data[flowType].points = [];
			this.data[flowType].pointerIds = [];
			this.data[flowType].pagePoints = [];
			this.data[flowType].started = false;
			this.data[flowType].ended = false;
			this.data[flowType].relatedTarget = null;
		};

		this.trigger = function(action, event, data) {
			this.sortedGestures.map(function(sorted) {
				return sorted.context;
			}).forEach(function(gesture) {
				if(gesture.paused && T.utils.isFunction(gesture[action]) && !gesture.cancelled) {
					gesture.addPausedCallback(action, event, data);
				} else if(T.utils.isFunction(gesture[action]) && !gesture.cancelled) {
					gesture[action].call(gesture, event, data);
				}
			}, this);
		};

		this.play = function(trigger) {
			trigger = trigger || false;
			this.sortedGestures.map(function(sorted) {
				return sorted.context;
			}).filter(function(gesture) {
				return gesture.paused;
			}).forEach(function(gesture) {
				gesture.play(trigger);
			});
		};

		this.pause = function(type, excludeGesture) {
			this.sortedGestures.map(function(sorted){
				return sorted.context;
			}).filter(function(gesture) {
				return type ? (excludeGesture !== gesture && type === gesture.type) : (excludeGesture !== gesture);
			}).forEach(function(gesture) {
				gesture.pause();
			});
		};

		this.addGesture = function(gesture) {
			this.gestures.push(gesture);
			this.sortGestures();

			if(this.gestures.length === 1) {
				this.activate();
			}
		};

		this.removeGesture = function(gesture) {
			this.gestures = this.gestures.filter(function(obj) {
				return obj !== gesture;
			});
			this.sortGestures();

			if(this.gestures.length === 0) {
				this.deactivate();
			}
		};

		this.removeGestures = function(type) {
			this.gestures.filter(function(obj) {
				return type ? (obj.type === type) : true;
			}).forEach(function(gesture) {
				this.removeGesture(gesture);
			}, this);
		};

		this.cancelGesture = function(gesture) {
			if(!gesture.cancelled) {
				gesture.cancel.call(gesture);
				gesture.cancelled = true;
			}
		};

		this.cancelGestures = function(excludeType) {
			this.gestures.filter(function(obj) {
				return obj.type !== excludeType;
			}).forEach(function(gesture) {
				this.cancelGesture(gesture);
			}, this);
			return this;
		};

		this.cancelAllGestures = function() {
			this.bindDoc(false);
			this.ended = true;
			this.gestures.forEach(function(gesture) {
				if (gesture.started) {
					this.cancelGesture(gesture);
				}
			}, this);
		};

		this.sortGestures = function() {
			this.sortedGestures = this.gestures.map(function(gesture) {
				return {
					key: gesture.sortKey,
					context: gesture
				};
			}).sort(function(g1, g2) {
				return g1.key - g2.key;
			});
		};

		this.bindDoc = function(on, type) {
			var flowTypes = T.utils.getFlowTypes(type),
				events;
			flowTypes.forEach(function(flowType){
				events = [T.utils.getEvent('update', flowType), T.utils.getEvent('end', flowType), T.utils.getEvent('cancel', flowType)];
				events.forEach(function(event) {
					if(event) {
						this[on ? 'on' : 'off'](doc, event);
					}
				}, this);
			}, this);
		};

		this.isOtherFlowStarted = function(type) {
			var flowTypes = T.utils.getFlowTypes(),
				len = flowTypes.length,
				i;
			for(i = 0; i < len; ++i) {
				if(type !== flowTypes[i] && this.data[flowTypes[i]].started) {
					return true;
				}
			}
			return false;
		};

		this.resetFlowTypes = function() {
			var flowTypes = T.utils.getFlowTypes(),
				len = flowTypes.length,
				i;
			for(i = 0; i < len; ++i) {
				if(this.data[flowTypes[i]].started && this.data[flowTypes[i]].ended) {
					this.reset(flowTypes[i]);
				}
			}
		};

		this.handleEvent = function(event) {
			var events = T.utils.getEvents(),
				flowType = T.utils.getFlowType(event.type);

			if(events.start.some(function(val) {
				return event.type === val;
			})) {
				if(this.isOtherFlowStarted(flowType)) {
					return;
				}
				this.resetFlowTypes();
				this.bindDoc(true, event.type);
				this.data[flowType].relatedTarget = event.target;
				this.setPoints(event);
				this.trigger('start', event, this.data[flowType]);
				this.data[flowType].started = true;
			} else if(events.update.some(function(val) {
				return event.type === val;
			})) {
				this.setPoints(event);
				this.trigger('update', event, this.data[flowType]);
			} else if(events.end.some(function(val) {
				return event.type === val;
			})) {
				this.bindDoc(false, event.type);
				this.trigger('end', event, this.data[flowType]);
				this.data[flowType].ended = true;
			} else if(events.cancel.some(function(val) {
				return event.type === val;
			})) {
				this.bindDoc(false, event.type);
				this.trigger('cancel', event, this.data[flowType]);
				this.data[flowType].ended = true;
			}
		};

		this.setPoints = function(event, touchList) {
			touchList = touchList || 'touches';

			var i, len, touches, pointerId, index,
				flowType = T.utils.getFlowType(event.type);

			switch(flowType) {
				case 'mouse':
					this.data[flowType].points.length = 1;
					this.data[flowType].pagePoints.length = 1;
					this.data[flowType].points[0] = T.utils.transformPoint(this.data[flowType].relatedTarget, new T.Point(event.pageX, event.pageY));
					this.data[flowType].pagePoints[0] = new T.Point(event.pageX, event.pageY);
					break;
				case 'touch':
					touches = event[touchList];
					len = touches.length;
					
					for(i = 0; i < len; ++i) {
						this.data[flowType].points.length = len;
						this.data[flowType].pagePoints.length = len;
						this.data[flowType].points[i] = T.utils.transformPoint(this.data[flowType].relatedTarget, new T.Point(touches[i].pageX, touches[i].pageY));
						this.data[flowType].pagePoints[i] = new T.Point(touches[i].pageX, touches[i].pageY);
					}
					break;
				case 'MSPointer':
				case 'pointer':
					pointerId = event.pointerId;
					index = this.data[flowType].pointerIds.indexOf(pointerId);
					if(index < 0 ) {
						index = this.data[flowType].pointerIds.push(pointerId) -1;
					}
					len = this.data[flowType].pointerIds.length;
					this.data[flowType].points.length = len;
					this.data[flowType].pagePoints.length = len;
					this.data[flowType].points[index] = T.utils.transformPoint(this.data[flowType].relatedTarget, new T.Point(event.pageX, event.pageY));
					this.data[flowType].pagePoints[index] = new T.Point(event.pageX, event.pageY);
					break;
				default: throw 'Not implemented!';
			}
		};

		function GestureHandler(element) {
			this.element = element;
			this.gestures = [];
			this.sortedGestures = [];
			this.data = {};
			T.utils.getFlowTypes().forEach(function(type) {
				this.data[type] = {};
				this.data[type].points = [];
				this.data[type].pointerIds = [];
				this.data[type].pagePoints = [];
				this.data[type].started = false;
				this.data[type].ended = false;
				this.data[type].relatedTarget = null;
			}, this);
		}
		return GestureHandler;
	});
})(window.Touche, window.document);

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
		 * @param {Numeric|[Numeric[]]}
		 * @returns {Boolean} Whether the event had the allowedBtn or not, always true for touch/MSPointer
		 */
		this.isValidMouseButton = function(event, allowedBtn) {
			if(T.utils.touch) {
				return true;
			}
			if(T.utils.msPointer && event.pointerType !== event.MSPOINTER_TYPE_MOUSE ) {
				return true;
			}
			var btn = event.button,
				which = event.which,
				actualBtn;

			actualBtn = (!which && btn !== undefined) ? ( btn & 1 ? 1 : ( btn & 2 ? 3 : ( btn & 4 ? 2 : 0 ) ) ) : which;
			return T.utils.isArray(allowedBtn) ? allowedBtn.some(function(val) {
				return actualBtn === val;
			}) : actualBtn === allowedBtn;
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

(function(T) {
	'use strict';

	T.Binder = Object.augment(function () {
		this.start = T.utils.noop;
		this.update = T.utils.noop;
		this.end = T.utils.noop;
		this.cancel = T.utils.noop;
		this.bind = function (obj) {
			Object.keys(obj || {}).forEach(function (key) {
				this[key] = obj[key];
			}, this);
		};

		function Binder(obj) {
			this.bind(obj);
		}
		return Binder;
	});
})(window.Touche);
(function(T, abs, sqrt, pow) {
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
		var xdist = abs(this.x - point.x),
			ydist = abs(this.y - point.y),
			dist = sqrt(pow(xdist, 2) + pow(ydist, 2));

		return dist;
	};
})(window.Touche, Math.abs, Math.sqrt, Math.pow);
(function(T) {
	'use strict';

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
})(window.Touche);
(function(T) {
	'use strict';

	/**
	 * Bind a doubletap event, used for basic interaction. Supports an area threshold for easier interaction
	 * on mobile devices.
	 * @name T.gestures.doubletap
	 * @function
	 */
	var Doubletap = T.Gesture.augment(function(Gesture) {
		this.defaults = {
			areaThreshold: 5,
			timeThreshold: 400,
			touches: 1,
			precedence: 4,
			preventDefault: true
		};

		this.on = function(elem) {
			this.count = 0;
			T(elem).on('tap', {
				options: this.options,
				id: this.id,
				end: this.end
			});
		};

		this.off = function(elem) {
			T(elem).off('tap', this.id);
		};

		this.end = function(event, data) {
			var self = this;
			++this.count;
			if(this.count === 1) {
				this.startTime = +new Date();
				this.gestureHandler.pause(null, this);
				this.timerId = setTimeout(function() {
					self.gestureHandler.play(true);
					self.count = 0;
				}, this.options.timeThreshold + 5);
			} else if(this.count === 2) {
				window.clearTimeout(this.timerId);
				this.endTime = +new Date();
				if((this.startTime + this.options.timeThreshold) >= this.endTime) {
					this.gestureHandler.play();
					this.binder.end.call(this, event, data);
				}
				this.count = 0;
			}

			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.cancel = function() {
			this.cancelled = true;
			window.clearTimeout(this.timerId);
		};

		function Doubletap() {
			Gesture.apply(this, arguments);
		}
		return Doubletap;
	});

	/*
	* Add the Doubletap gesture to Touché
	*/
	T.gestures.add('doubletap', Doubletap);

})(window.Touche);
(function(T) {
	'use strict';

	/**
	 * Longtap gesture, Supports an area threshold for easier interaction
	 * on mobile devices. Triggers `start`, `update` and `end` events.
	 * @name T.gestures.longtap
	 * @function
	 */
	var Longtap = T.Gesture.augment(function(Gesture) {

		this.defaults = {
			areaThreshold: 5,
			timeThreshold: 800,
			precedence: 5,
			preventDefault: true,
			touches: 1,
			interval: 25,
			which: 1
		};

		this.preventDefaultForMSPointer = function(on) {
			if(!T.utils.msPointer) {
				return;
			}

			var doc = window.document,
				events = ['MSHoldVisual', 'MSGestureHold', 'contextmenu'],
				prevent = function(e) {
					e.preventDefault();
				};

			on = on || true;
			events.forEach(function(event) {
				doc[on ? 'addEventListener' : 'removeEventListener'](event, prevent, false);
			});
		};

		this.pause = function() {
			this.paused = true;
			window.clearTimeout(this.timerId);
		};

		this.start = function(event, data) {
			if( !this.isValidMouseButton(event, this.options.which) ||
				this.hasMoreTouches(data.points)) {
				this.cancel();
				return;
			}
			this.rect = T.utils.getRect(this.gestureHandler.element);
			this.count = 0;
			this.intervalSteps = this.options.timeThreshold / this.options.interval;
			this.startTime = +new Date();

			var self = this;
			window.clearTimeout(self.timerId);
			self.timerId = window.setInterval(function(){
				++self.count;
				data.percentage = self.count/self.intervalSteps * 100;
								
				if(self.count === 1) {
					self.binder.start.call(self.binder, event, data);
					self.startFired = true;
				} else {
					self.binder.update.call(self.binder, event, data);
				}

				if(self.count >= self.intervalSteps) {
					window.clearTimeout(self.timerId);
				}
			}, this.options.interval);

			if(this.options.preventDefault) {
				event.preventDefault();
				this.preventDefaultForMSPointer();
			}
		};

		this.update = function(event, data) {
			if(this.hasMoreTouches(data.points) ||
				!this.rect.pointInside(data.points[0], this.options.areaThreshold)) {
				this.cancel();
			}
			
			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};
		
		this.end = function(event, data) {
			window.clearTimeout(this.timerId);
			if(this.hasNotEqualTouches(data.points)) {
				this.cancel();
				return;
			}
			if(this.rect.pointInside(data.points[0], this.options.areaThreshold) &&
				this.startTime + this.options.timeThreshold <= +new Date()) {
				this.gestureHandler.cancelGestures(this.type);
				this.binder.end.call(this, event, data);
			} else {
				this.cancel();
			}

			if(this.options.preventDefault) {
				event.preventDefault();
				this.preventDefaultForMSPointer(false);
			}
		};

		this.cancel = function() {
			if(this.cancelled) {
				return;
			}
			this.cancelled = true;
			window.clearTimeout(this.timerId);
			if(this.startFired && this.count > 0) {
				this.binder.cancel.call(this.binder);
				this.startFired = false;
			}
			this.preventDefaultForMSPointer(false);
		};

		function Longtap() {
			Gesture.apply(this, arguments);
		}
		return Longtap;
	});

	/*
	* Add the Longtap gesture to Touché
	*/
	T.gestures.add('longtap', Longtap);

})(window.Touche);

(function(T, abs) {
	'use strict';

	/**
	 * Pinch gesture. Supports a pinch threshold that is used to measure when the gesture starts.
	 * Triggers `start`, `update` and `end` events.
	 * @name T.gestures.pinch
	 * @function
	 */
	var Pinch = T.Gesture.augment(function(Gesture) {

		this.defaults ={
			pinchThreshold: 8,
			preventDefault: true
		};

		this.start = function(event, data) {
			this.rect = T.utils.getRect(this.gestureHandler.element);
			this.pinch = {
				start: {},
				current: {}
			};

			if(this.hasMoreTouches(data.points)) {
				this.cancel();
				return;
			}

			this.pinch.start.point1 = data.points[0];
			this.pinch.start.point2 = data.points[1];

			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};
		
		this.update = function(event, data) {
			if(this.hasMoreTouches(data.points)) {
				this.cancel();
				return;
			} else if(this.countTouches === this.options.touches) {
				if(!this.pinch.start.point2) {
					this.pinch.start.point2 = data.points[1];
				} else {
					this.pinch.current.point1 = data.points[0];
					this.pinch.current.point2 = data.points[1];
					this.startDistance = this.pinch.start.point2.distanceTo(this.pinch.start.point1);
					this.currentDistance = this.pinch.current.point2.distanceTo(this.pinch.current.point1);
					this.pinch = abs(this.startDistance - this.currentDistance);
					this.scale = this.currentDistance / this.startDistance;
					data.scale = this.scale;

					if(!this.started && this.pinch >= this.options.pinchThreshold) {
						this.started = true;
						this.gestureHandler.cancelGestures(this.type);
						this.binder.start.call(this, event, data);
					} else if(this.started) {
						this.binder.update.call(this, event, data);
					}
				}
			}

			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.end = function(event, data) {
			if(this.started) {
				this.binder.end.call(this, event, data);
			}

			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.cancel = function() {
			if(this.cancelled) {
				return;
			}
			this.cancelled = true;
			if(this.started) {
				this.binder.cancel.call(this.bindingObj);
			}
		};

		function Pinch() {
			Gesture.apply(this, arguments);
		}
		return Pinch;
	});

	T.gestures.add('pinch', Pinch);

})(window.Touche, Math.abs);
(function(T) {
	'use strict';

	/**
	 * Rotate gesture. Supports a rotation threshold that is used to measure when the gesture starts.
	 * Triggers `start`, `update` and `end` events.
	 * @name T.gestures.rotate
	 * @function
	 */
	var Rotate = T.Gesture.augment(function(Gesture) {

		this.defaults = {
			rotationThreshold: 12,
			preventDefault: true
		};
		
		this.start = function(event, data) {
			this.rect = T.utils.getRect(this.gestureHandler.element);
			this.rotate = {
				start: {},
				current: {}
			};

			if(this.hasMoreTouches(data.points)) {
				this.cancel();
				return;
			}

			this.rotate.start.point1 = data.points[0];
			this.rotate.start.point2 = data.points[1];

			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.update = function(event, data) {
			if(this.hasMoreTouches(data.points)) {
				this.cancel();
				return;
			} else if(this.countTouches === this.options.touches) {
				if(!this.rotate.start.point2) {
					this.rotate.start.point2 = data.points[1];
				} else {
					this.rotate.current.point1 = data.points[0];
					this.rotate.current.point2 = data.points[1];
					this.startAngle = T.utils.getDeltaAngle(this.rotate.start.point2, this.rotate.start.point1);
					this.currentAngle = T.utils.getDeltaAngle(this.rotate.current.point2, this.rotate.current.point1);
					this.rotation = this.currentAngle - this.startAngle;
					data.rotation = this.rotation;

					if(!this.started && this.rotation >= this.options.rotationThreshold) {
						this.started = true;
						this.gestureHandler.cancelGestures(this.type);
						this.binder.start.call(this, event, data);
					} else if(this.started) {
						this.binder.update.call(this, event, data);
					}
				}
			}

			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.end = function(event, data) {
			if(this.started) {
				this.binder.end.call(this, event, data);
			}

			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.cancel = function() {
			if(this.cancelled) {
				return;
			}
			this.cancelled = true;
			if(this.started) {
				this.bindingObj.cancel.call(this.bindingObj);
			}
		};

		function Rotate() {
			Gesture.apply(this, arguments);
		}
		return Rotate;
	});

T.gestures.add('rotate', Rotate);

})(window.Touche);
(function(T, abs) {
	'use strict';

	/**
	 * Swipe gesture. Supports a radius threshold that is used to measure when the gesture starts.
	 * Triggers `start`, `update` and `end` events.
	 * @name T.gestures.swipe
	 * @function
	 */
	var Swipe = T.Gesture.augment(function(Gesture) {
		
		this.defaults = {
			radiusThreshold: 12,
			preventDefault: true,
			touches: 1,
			which: 1
		};

		this.setSwipe = function(point) {
			this.swipe.currentPoint = point;
			this.swipe.currentTime = +new Date();
			this.swipe.deltaX = this.swipe.currentPoint.x - this.swipe.startPoint.x;
			this.swipe.deltaY = this.swipe.currentPoint.y - this.swipe.startPoint.y;
			this.swipe.velocity = T.utils.getVelocity(this.swipe.startPoint, this.swipe.currentPoint, this.swipe.startTime, this.swipe.currentTime);
			this.swipe.angle = T.utils.getAngle(this.swipe.startPoint, this.swipe.currentPoint);
			this.swipe.direction = T.utils.getDirection(this.swipe.angle);
			this.swipe.elementDistance = this.swipe.direction === 'left' || this.swipe.direction === 'right' ? this.rect.width : this.rect.height;
			this.swipe.distance = this.swipe.direction === 'left' || this.swipe.direction === 'right' ? abs(this.swipe.deltaX) : abs(this.swipe.deltaY);
			this.swipe.percentage = this.swipe.distance / this.swipe.elementDistance * 100;
		};

		this.start = function(event, data) {
			this.rect = T.utils.getRect(this.gestureHandler.element);
			this.swipe = {};

			this.countTouches = 0;
			if( !this.isValidMouseButton(event, this.options.which) ||
				this.hasNotEqualTouches(data.points)) {
				this.cancel();
				return;
			}

			this.swipe.startPoint = data.points[0];
			this.swipe.startTime = +new Date();

			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.update = function(event, data) {
			if(this.hasNotEqualTouches(data.points)) {
				this.cancel();
				return;
			}

			this.setSwipe(data.points[0]);
			data.swipe = this.swipe;

			if(!this.started && this.swipe.startPoint.distanceTo(this.swipe.currentPoint) >= this.options.radiusThreshold) {
				this.gestureHandler.cancelGestures(this.type);
				this.started = true;
				this.binder.start.call(this, event, data);
			} else if(this.started) {
				this.binder.update.call(this, event, data);
			}

			this.swipe.startTime = this.swipe.currentTime; //to calculate correct velocity
			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.end = function(event, data) {
			if(this.started) {
				this.binder.end.call(this, event, data);
			}

			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.cancel = function() {
			if(this.cancelled) {
				return;
			}
			this.cancelled = true;
			if(this.started) {
				this.binder.cancel.call(this.bindingObj);
			}
		};

		function Swipe() {
			Gesture.apply(this, arguments);
		}
		return Swipe;
	});

	/*
	* Add the Swipe gesture to Touché
	*/
	T.gestures.add('swipe', Swipe);

})(window.Touche, Math.abs);
(function(T) {
	'use strict';

	/**
	 * Tap gesture
	 * @name T.gestures.tap
	 * @function
	 */
	var Tap = T.Gesture.augment(function(Gesture) {

		this.defaults =  {
			areaThreshold: 5,
			precedence: 6,
			preventDefault: true,
			touches: 1,
			which: 1
		};

		this.start = function(event, data) {
			this.started = true;
			this.rect = T.utils.getRect(this.gestureHandler.element);
			if( !this.isValidMouseButton(event, this.options.which) ||
				this.hasMoreTouches(data.points)) {
				this.cancel();
				return;
			}

			this.binder.start.call(this, event, data);
			
			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.update = function(event, data) {
			if(this.hasMoreTouches(data.points) ||
				!this.rect.pointInside(data.points[0], this.options.areaThreshold)) {
				this.cancel();
				return;
			}

			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.end = function(event, data) {
			if(this.hasNotEqualTouches(data.points)) {
				return;
			}
			if(this.rect.pointInside(data.points[0], this.options.areaThreshold)) {
				this.binder.end.call(this, event, data);
			}
			if(this.options.preventDefault) {
				event.preventDefault();
			}
		};

		this.cancel = function(event, data) {
			this.cancelled = true;
			this.binder.cancel.call(this, event, data);
		};

		function Tap() {
			Gesture.apply(this, arguments);
		}

		return Tap;
	});

	/*
	* Add the Tap gesture to Touché
	*/
	T.gestures.add('tap', Tap);

})(window.Touche);