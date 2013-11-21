/*! Touché - v1.0.10 - 2013-11-21
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

	T._handlers = [];

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

			if(el && T.utils.isSVG(el)) {
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
		 * Get the velocity using two points, pixels/frame (based on 60 fps)
		 * @name T.utils.getVelocity
		 * @function
		 * @param {T.Point} startPoint The starting point (startPoint.x, startPoint.y)
		 * @param {T.Point} currentPoint The end point (currentPoint.x, currentPoint.y)
		 * @param {Number} startTime The start time
		 * @param {Number} currentTime The end time
		 * @returns {Number} The velocity
		 */
		getVelocity: function( startPoint, currentPoint, startTime, currentTime ) {
			var dist = startPoint.distanceTo(currentPoint),
				timeElapsed = currentTime - startTime;
			return dist * 26.67 / timeElapsed;
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
(function(T, doc) {

	T.FlowHandler = Object.augment(function() {

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
			this.resetFlowTypes();
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

		/**
		 * Detects tapping on a scrollbar. If there are more than one touch in the
		 * event it will return true if at least one touch is on a scrollbar.
		 * @param {Event} event The event that was triggered by the tap
		 * @return {Boolean} true if a scrollbar was tapped else false
		 */
		function detectTapOnScrollbar(event) {
			var offsetWidth = event.target.offsetWidth;
			var clientWidth = event.target.clientWidth;
			var offsetHeight = event.target.offsetHeight;
			var clientHeight = event.target.clientHeight;
			var tapOnVerticalScrollbar = false;
			var tapOnHorizontalScrollbar = false;

			if (event.touches) {
				// There could be multiple touches so we check each of them
				event.touches.forEach(function (touch) {
					tapOnVerticalScrollbar = tapOnVerticalScrollbar || (offsetWidth > clientWidth && touch.pageX > clientWidth);
					tapOnHorizontalScrollbar = tapOnHorizontalScrollbar || (offsetHeight > clientHeight && touch.pageY > clientHeight);
				});
			} else {
				tapOnVerticalScrollbar = offsetWidth > clientWidth && event.offsetX > clientWidth;
				tapOnHorizontalScrollbar = offsetHeight > clientHeight && event.offsetY > clientHeight;
			}

			return tapOnVerticalScrollbar || tapOnHorizontalScrollbar;
		}

		this.handleEvent = function(event) {
			switch(event.type) {
				case "mousedown":
				case "touchstart":
				case "MSPointerDown":
				case "pointerstart":
					// Ignore the event if it is triggered on a scrollbar
					// This is a workaround to the issue that IE does not trigger mouseup when clicking on a scrollbar:
					// http://social.msdn.microsoft.com/Forums/vstudio/en-US/3749b8a1-53ef-48fe-be81-b2df39d6154f/mouseup-event-of-vertical-scroll-bar?forum=netfxjscript
					if ( !detectTapOnScrollbar( event ) ) {
						this.onStart( event );
					}
					break;
				case "mousemove":
				case "touchmove":
				case "MSPointerMove":
				case "pointermove":
					this.onUpdate(event);
					break;
				case "mouseup":
				case "touchend":
				case "MSPointerUp":
				case "pointerup":
					this.onEnd(event);
					break;
				case "touchcancel":
				case "MSPointerCancel":
				case "pointercancel":
					this.onCancel(event);
					break;
			}
		};

		this.onStart = function() {};
		this.start = function() {};
		this.onUpdate = function() {};
		this.update = function() {};
		this.onEnd = function() {};
		this.end = function() {};
		this.onCancel = function() {};
		this.cancel = function() {};

		function FlowHandler(element) {
			this.element = element;
		}
		return FlowHandler;
	});

})(window.Touche, window.document);

(function(T){
	'use strict';

	var lastTouchPoints = [], timerId;

	function setLastTouch(points) {
		lastTouchPoints.length = 0;
		clearTimeout(timerId);
		points.forEach(function(point) {
			lastTouchPoints.push(new T.Point(point.x, point.y));
		});
		timerId = setTimeout(function() {
			lastTouchPoints.length = 0;
		}, 800);
	}

	/**
	 * Represents a handler for gestures, used to set up basic structure for creating gestures.
	 * @name T.GestureHandler
	 * @class
	 * @param {DOMElement} element The element attached to the {@link T.GestureHandler}
	 */
	T.GestureHandler = T.FlowHandler.augment(function(FlowHandler, _super) {

		this.reset = function(flowType) {
			this.gestures.forEach(function(gesture) {
				gesture.reset();
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
					gesture[action](event, data);
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
				gesture.cancel();
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
			this.gestures.forEach(function(gesture) {
				this.cancelGesture(gesture);
			}, this);
			this.resetFlowTypes(true);
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

		this.resetFlowTypes = function(force) {
			force = force || false;

			var flowTypes = T.utils.getFlowTypes(),
				len = flowTypes.length,
				i;
			for(i = 0; i < len; ++i) {
				if(this.data[flowTypes[i]].started && this.data[flowTypes[i]].ended) {
					this.reset(flowTypes[i]);
				} else if(force) {
					this.reset(flowTypes[i]);
				}
			}
		};

		this.isEmulatedMouseEvents = function(event) {
			if(event.isSimulated) {
				return false;
			}

			var flowType = T.utils.getFlowType(event.type),
				lastPoint,
				point = new T.Point(event.pageX, event.pageY);

			if(flowType !== "mouse") {
				return false;
			}

			if(lastTouchPoints.length !== 1) {
				return false;
			}

			lastPoint = lastTouchPoints[0];

			if(point.distanceTo(lastPoint) < 25) {
				return true;
			}

			return false;
		};

		this.onStart = function(event) {
			T._superHandler.addHandler(this, event);
		};

		this.start = function(event) {
			var flowType = T.utils.getFlowType(event.type);
			if(this.isOtherFlowStarted(flowType) || this.isEmulatedMouseEvents(event)) {
				return;
			}
			this.resetFlowTypes();
			this.data[flowType].relatedTarget = event.target;
			this.setPoints(event);
			this.trigger('start', event, this.data[flowType]);
			this.data[flowType].started = true;
		};

		this.update = function(event) {
			var flowType = T.utils.getFlowType(event.type);
			if(this.isOtherFlowStarted(flowType) || this.isEmulatedMouseEvents(event)) {
				return;
			}
			this.setPoints(event);
			this.trigger('update', event, this.data[flowType]);
		};

		this.end = function(event) {
			var flowType = T.utils.getFlowType(event.type);

			// Solves the cases where the browser dont fire touchend but mouseup
			if ( this.data.touch.started && !this.data.touch.ended && event.type === 'mouseup' ) {
				this.trigger('end', event, this.data.touch);
				this.data.touch.ended = true;
				return;
			}

			if(this.isOtherFlowStarted(flowType) || this.isEmulatedMouseEvents(event)) {
				return;
			}
			this.trigger('end', event, this.data[flowType]);
			this.data[flowType].ended = true;
		};

		this.cancel = function(event) {
			var flowType = T.utils.getFlowType(event.type);
			this.trigger('cancel', event, this.data[flowType]);
			this.data[flowType].ended = true;
		};

		this.handleEvent = function(event) {
			var flowType = T.utils.getFlowType(event.type);

			if(this.isOtherFlowStarted(flowType) || this.isEmulatedMouseEvents(event)) {
				return;
			}

			_super.handleEvent.call(this, event);
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
					setLastTouch(this.data[flowType].pagePoints);
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
					setLastTouch(this.data[flowType].pagePoints);
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
})(window.Touche);

(function(T, doc) {
	T.SuperHandler = T.FlowHandler.augment(function() {

		this.addHandler = function(handler) {
			var index = this._handlers.indexOf(handler);
			if(index === -1) {
				this._handlers.push(handler);
			}
		};

		this.onStart = function(event) {
			this._handlers.forEach(function(handler) {
				handler.start(event);
			});
			this.bindDoc(true, event.type);
		};

		this.onUpdate = function(event) {
			this._handlers.forEach(function(handler) {
				handler.update(event);
			});
		};

		this.onEnd = function(event) {
			this.bindDoc(false, event.type);
			this._handlers.forEach(function(handler) {
				handler.end(event);
			});
			this._handlers.length = 0;
		};

		this.onCancel = function(event) {
			this.bindDoc(false, event.type);
			this._handlers.forEach(function(handler) {
				handler.cancel(event);
			});
			this._handlers.length = 0;
		};

		this.onDragStart = function() {
			this._handlers.forEach(function(handler) {
				handler.cancelAllGestures();
			});
		};

		function SuperHandler() {
			this._handlers = [];
			T.FlowHandler.apply(this, arguments);
		}
		return SuperHandler;
	});

	T._superHandler = new T.SuperHandler(doc);
	T._superHandler.activate();

	/**
	* Bind dragstart event to make sure we cancel all active gestures,
	* since a native drag gesture is not compatible with Touché.
	*/
	document.addEventListener("dragstart", function(e) {
		T._superHandler.onDragStart(e);
	}, false);

	T.preventGestures = function(preventer) {
		var i, handlers = T._superHandler._handlers, handler, len = handlers.length;

		for(i = len - 1; i >= 0; --i) {
			handler = handlers[i];
			if(handler === preventer) {
				break;
			}
			handler.cancelAllGestures();
			handlers.splice(i, 1);
		}
	};


})(window.Touche, window.document);
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
					this[obj.action](obj.event, obj.data);
				}, this);
			} else {
				this.gestureHandler.cancelGesture(this);
			}
			this.paused = false;
			this.pausedCallbacks = [];
			this.reset();
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
		 * Determine if the event has equal number of touches
		 * @name T.Gesture#hasEqualTouches
		 * @function
		 * @param {[Points]} points The points to evaluate
		 * @returns {Boolean} Whether the event equal the set number
		 */
		this.hasEqualTouches = function(points) {
			this.countTouches = points.length;
			return this.countTouches === this.options.touches;
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

		this.reset = function() {
			if(this.paused) {
				return;
			}
			this.started = false;
			this.cancelled = false;
			this.countTouches = 0;
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
// polyfill for requestAnimationFrame if necessary
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
 
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());
