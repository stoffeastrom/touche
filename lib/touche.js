(function() {
	'use strict';

	var T = window.Touche = {},
		abs = Math.abs,
		sqrt = Math.sqrt,
		pow = Math.pow,
		atan2 = Math.atan2,
		PI = Math.PI,
		sortExpando = 9,
		getSortKey = function() {
			return 5 * (++sortExpando);
		},
		doc = window.document,
		touch = ('ontouchstart' in window),
		events = {
			start: touch ? 'touchstart' : 'mousedown',
			move: touch ? 'touchmove' : 'mousemove',
			end: touch ? 'touchend' : 'mouseup'
		};

	T.utils = {
		logger: function(event, touchList) {
			if(!event.touches) return;
			touchList = touchList || 'touches';

			var str = "",
				i, len = event[touchList].length;

			str += "touches: " + len;

			for(i = 0; i < len; ++i) {
				str += " x:" + event.touches[i].pageX + " y:" + event.touches[i].pageY;
			}

			window.console.log(str);
		},
		isFunction: function(f) {
			return Object.prototype.toString.call(f) === '[object Function]';
		},
		isArray: function(a) {
			return Array.isArray(a);
		},
		isObject: function(o) {
			return Object.prototype.toString.call(o) === '[object Object]';
		},
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
		getAngle: function(startPoint, currentPoint) {
			var x = startPoint.x - currentPoint.x,
				y = startPoint.y - currentPoint.y,
				theta = atan2(y, x),
				degrees = theta * 180 / PI;
			degrees = degrees < 0 ? 360 + degrees : degrees;
			return degrees;
		},
		getDeltaAngle: function(startPoint, currentPoint) {
			var x = currentPoint.x - startPoint.x,
				y = currentPoint.y - startPoint.y,
				theta = atan2(y, x),
				degrees = theta * 180 / PI;
			return degrees;
		},
		getDirection: function(degrees) {
			return((degrees >= 0 && degrees < 45) || (degrees >= 315 && degrees <= 360)) ? 'right' : (degrees >= 45 && degrees < 135) ? 'down' : (degrees >= 135 && degrees < 225) ? 'left' : (degrees >= 225 && degrees < 315) ? 'up' : 'invalid';
		},
		getVelocity: function(startPoint, currentPoint, startTime, currentTime) {
			var dist = startPoint.distanceTo(currentPoint),
				timeElapsed = currentTime - startTime;
			return dist / timeElapsed;
		}
	};


	/**
	 * Represents a coordinate/point.
	 * @name Point
	 * @class
	 * @param {Number} x
	 * @param {Number} y
	 */
	T.Point = function(x, y) {
		this.x = x;
		this.y = y;
	};

	T.Point.prototype.distanceTo = function(point) {
		var xdist = abs(this.x - point.x),
			ydist = abs(this.y - point.y),
			dist = sqrt(pow(xdist, 2) + pow(ydist, 2));

		return dist;
	};

	/**
	 * Represents a rectangle.
	 * @name Rect
	 * @class
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} width
	 * @param {Number} height
	 */
	T.Rect = function(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	};

	T.Rect.prototype.pointInside = function(point, threshold) {
		threshold = threshold || 0;
		var minX = this.x - threshold,
			minY = this.y - threshold,
			maxX = this.x + this.width + threshold,
			maxY = this.y + this.height + threshold;

		return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
	};

	T.getRect = function(target) {
		return new T.Rect(target.offsetLeft, target.offsetTop, target.offsetWidth, target.offsetHeight);
	};

	/**
	 * Represents a cache, used to store data separate from a DOM element.
	 * @name Cache
	 * @class
	 */
	T.Cache = function() {
		this.data = {};
	};

	T.Cache.prototype.add = function(elem, context) {
		this.data[elem] = this.data[elem] || {};
		this.data[elem].context = this.data[elem].context || context;

		return this.data[elem];
	};

	T.Cache.prototype.get = function(elem) {
		return this.data[elem] || T.cache.add(elem, new T.GestureController(elem));
	};

	T.cache = new T.Cache();


	/**
	 * Represents a controller for gestures, used to set up basic structure for creating gestures.
	 * @name GestureController
	 * @class
	 * @param {DOMElement} element
	 */
	T.GestureController = function(element) {
		this.element = element;
		this.gestures = [];
		this.sortedGestures = [];
		this.data = {};
		this.data.points = [];
	};

	T.GestureController.prototype.activate = function() {
		this.on(this.element, events.start);
	};
	T.GestureController.prototype.deactivate = function() {
		this.off(this.element, events.start);
		this.bindDoc(false);
	};

	T.GestureController.prototype.on = function(element, event) {
		element.addEventListener(event, this, false);
	};

	T.GestureController.prototype.off = function(element, event) {
		element.removeEventListener(event, this, false);
	};

	T.GestureController.prototype.reset = function() {
		this.gestures.forEach(function(gesture) {
			gesture.cancelled = false;
		});
	};

	T.GestureController.prototype.trigger = function(action, event, data) {
		var key, gesture, gestures = this.sortedGestures;

		for(key in gestures) {
			if(gestures.hasOwnProperty(key) && T.utils.isObject(gestures[key])) {
				gesture = gestures[key].context;
				if(T.utils.isFunction(gesture[action]) && !gesture.cancelled) {
					gesture[action].call(gesture, event, data);
				}
			}
		}
	};

	T.GestureController.prototype.addGesture = function(gesture) {
		this.gestures.push(gesture);
		this.sortGestures();

		if(this.gestures.length === 1) {
			this.activate();
		}
	};

	T.GestureController.prototype.removeGesture = function(type, gesture) {
		this.gestures = this.gestures.filter(function(obj) {
			return obj !== gesture;
		});
		this.sortGestures();

		if(this.gestures.length === 0) {
			this.deactivate();
		}
	};

	T.GestureController.prototype.cancelGestures = function(type) {
		this.gestures.filter(function(obj) {
			return obj.type === type;
		}).forEach(function(gesture) {
			gesture.cancelled = true;
			gesture.cancel.call(gesture);
		});
		return this;
	};

	T.GestureController.prototype.cancelGesturesWithTouches = function(type, touches) {
		this.gestures.filter(function(obj) {
			return obj.type === type && obj.options.touches === touches;
		}).forEach(function(gesture) {
			gesture.cancelled = true;
			gesture.cancel.call(gesture);
		});
		return this;
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

	T.GestureController.prototype.getGesture = function(type) {
		return this.gestures.filter(function(obj) {
			return obj.type === type;
		});
	};

	T.GestureController.prototype.bindDoc = function(on) {
		this[on ? 'on' : 'off'](doc, events.move);
		this[on ? 'on' : 'off'](doc, events.end);
	};

	T.GestureController.prototype.handleEvent = function(event) {
		//console.log(this, event.type, event);
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

		if(touch) {
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
	 * Represents a base gesture, never used on its own, it's use as a base for actual gestures.
	 * @name Gesture
	 * @class
	 * @param {DOMElement} elem
	 * @param {String} type
	 * @param {Object} gesture
	 */
	T.Gesture = function(elem, type, touches) {
		this.elem = elem;
		this.rect = T.getRect(elem);
		this.type = type;
		this.cancelled = false;
		this.touches = touches;
		this.countTouches = 0;
	};

	T.Gesture.prototype.hasMoreTouches = function(event, touchList) {
		touchList = touchList || 'touches';
		this.countTouches = event[touchList] && event[touchList].length > this.countTouches ? event[touchList].length : (this.countTouches || 1);
		return this.countTouches > 0 && this.countTouches > this.touches;
	};

	T.Gesture.prototype.hasNotEqualTouches = function(event, touchList) {
		touchList = touchList || 'touches';
		this.countTouches = event[touchList] && event[touchList].length > this.countTouches ? event[touchList].length : (this.countTouches || 1);
		return this.countTouches > 0 && this.countTouches !== this.touches;
	};

	T.gesture = function(elem, type, gesture) {
		var g = new T.Gesture(elem, type, gesture.options.touches);
		g.start = function() {};
		g.update = function() {};
		g.end = function() {};
		g.cancel = function() {};
		g.sortKey = gesture.options.precedence || getSortKey();
		T.utils.extend(g, gesture);
		return g;
	};
})();