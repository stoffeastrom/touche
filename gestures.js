(function() {
	var G = window.Gestures = {},
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

	G.utils = {
		logger: function(event, touchList) {
			if(!event.touches) return;
			touchList = touchList || 'touches';

			var str = "",
				i, len = event[touchList].length;

			str += "touches: " + len;

			for(i = 0; i < len; ++i) {
				str += " x:" + event.touches[i].pageX + " y:" + event.touches[i].pageY;
			}
			console.log(str);
		},
		isFunction: function(f) {
			return Object.prototype.toString.call(f) === '[object Function]';
		},
		isObject: function(o) {
			return o instanceof Object;
		},
		extend: function(src1, src2) {
			var key;

			if(!src2) {
				return src1;
			}

			for(key in src2) {
				src1[key] = src2[key];
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
			return((degrees >= 0 && degrees < 45) || (degrees >= 315)) ? 'right' : (degrees >= 45 && degrees < 135) ? 'down' : (degrees >= 135 && degrees < 225) ? 'left' : (degrees >= 225 && degrees < 315) ? 'up' : 'invalid';
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
	G.Point = function(x, y) {
		this.x = x;
		this.y = y;
	};

	G.Point.prototype.distanceTo = function(point) {
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
	G.Rect = function(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	};

	G.Rect.prototype.pointInside = function(point, threshold) {
		threshold = threshold || 0;
		var minX = this.x - threshold,
			minY = this.y - threshold,
			maxX = this.x + this.width + threshold,
			maxY = this.y + this.height + threshold;

		return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
	};

	G.getRect = function(target) {
		return new G.Rect(target.offsetLeft, target.offsetTop, target.offsetWidth, target.offsetHeight);
	};

	/**
	 * Represents a cache, used to store data separate from a DOM element.
	 * @name Cache
	 * @class
	 */
	G.Cache = function() {
		this.data = {};
	};

	G.Cache.prototype.add = function(elem, context) {
		this.data[elem] = this.data[elem] || {};
		this.data[elem].context = this.data[elem].context || context;

		return this.data[elem];
	};

	G.Cache.prototype.get = function(elem) {
		return this.data[elem] || G.cache.add(elem, new G.GestureController(elem));
	};

	G.cache = new G.Cache();


	/**
	 * Represents a controller for gestures, used to set up basic structure for creating gestures.
	 * @name GestureController
	 * @class
	 * @param {DOMElement} element
	 */
	G.GestureController = function(element) {
		this.element = element;
		this.gestures = [];
		this.sortedGestures = [];
		this.data = {};
		this.data.points = [];
	};

	G.GestureController.prototype.activate = function() {
		this.on(this.element, events.start);
	};
	G.GestureController.prototype.deactivate = function() {
		this.off(this.element, events.start);
		this.bindDoc(false);
	};

	G.GestureController.prototype.on = function(element, event) {
		element.addEventListener(event, this, false);
	};

	G.GestureController.prototype.off = function(element, event) {
		element.removeEventListener(event, this, false);
	};

	G.GestureController.prototype.reset = function() {
		this.gestures.forEach(function(gesture) {
			gesture.cancelled = false;
		});
	};

	G.GestureController.prototype.trigger = function(action, event, data) {
		var key, gesture, gestures = this.sortedGestures;

		for(key in gestures) {
			if(gestures.hasOwnProperty(key) && G.utils.isObject(gestures[key])) {
				gesture = gestures[key].context;
				if(G.utils.isFunction(gesture[action]) && !gesture.cancelled) {
					gesture[action].call(gesture, event, data);
				}
			}
		}
	};

	G.GestureController.prototype.addGesture = function(gesture) {
		this.gestures.push(gesture);
		this.sortGestures();

		if(this.gestures.length === 1) {
			this.activate();
		}
	};

	G.GestureController.prototype.removeGesture = function(type, gesture) {
		this.gestures = this.gestures.filter(function(obj) {
			return obj !== gesture;
		});
		this.sortGestures();

		if(this.gestures.length === 0) {
			this.deactivate();
		}
	};

	G.GestureController.prototype.cancelGestures = function(type) {
		this.gestures.filter(function(obj) {
			return obj.type === type;
		}).forEach(function(gesture) {
			gesture.cancelled = true;
		});
		return this;
	};

	G.GestureController.prototype.cancelGesturesWithTouches = function(type, touches) {
		this.gestures.filter(function(obj) {
			return obj.type === type && obj.options.touches === touches;
		}).forEach(function(gesture) {
			gesture.cancelled = true;
		});
		return this;
	};

	G.GestureController.prototype.sortGestures = function(type) {
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

	G.GestureController.prototype.getGesture = function(type) {
		return this.gestures.filter(function(obj) {
			return obj.type === type;
		});
	};

	G.GestureController.prototype.bindDoc = function(on) {
		this[on ? 'on' : 'off'](doc, events.move);
		this[on ? 'on' : 'off'](doc, events.end);
	};

	G.GestureController.prototype.handleEvent = function(event) {
		//console.log(this, event.type, event);
		switch(event.type) {
		case events.start:
			this.bindDoc(true);
			this.setPoints(event)
			this.trigger('start', event, this.data);
			break;
		case events.move:
			this.setPoints(event)
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

	G.GestureController.prototype.setPoints = function(event, touchList) {
		touchList = touchList || 'touches';

		var i, len, touches;

		if(touch) {
			touches = event[touchList];
			len = touches.length;
			for(i = 0; i < len; ++i) {
				this.data.points.length = len;
				this.data.points[i] = new G.Point(touches[i].pageX, touches[i].pageY);
			}
		} else {
			this.data.points.length = 1;
			this.data.points[0] = new G.Point(event.pageX, event.pageY);
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
	G.Gesture = function(elem, type) {
		this.elem = elem;
		this.rect = G.getRect(elem);
		this.type = type;
		this.cancelled = false;
		//this.countTouches = 0;
	};

	G.gesture = function(elem, type, gesture) {
		var g = new G.Gesture(elem, type);
		g.start = function() {};
		g.update = function() {};
		g.end = function() {};
		g.cancel = function() {};
		g.sortKey = gesture.options.precedence || getSortKey();
		G.utils.extend(g, gesture);
		return g;
	};

	/**
	 * Bind a tap event, used for basic interaction. Supports a area threshold for easier interaction
	 * on mobile devices. Triggers `start`, `update` and `end` events.
	 * @name G#tap
	 * @param {DOMElement} elem
	 * @param {Object} Data to set up the gesture
	 */
	G.tap = function(elem, gesture) {
		gesture = G.utils.extend({
			options: {
				areaThreshold: 5,
				precedence: 5,
				preventDefault: true,
				touches: 1
			},
			start: function() {},
			update: function() {},
			end: function() {}
		}, gesture);

		var inst = G.cache.get(elem),
			touches = gesture.options.touches,
			preventDefault = gesture.options.preventDefault,
			countTouches;

		inst.context.addGesture(G.gesture(elem, 'tap', {
			options: gesture.options,
			start: function(event, data) {
				countTouches = 0;
				countTouches = event.touches && event.touches.length > countTouches ? event.touches.length : 1;
				if(countTouches > 0 && countTouches > touches) {
					inst.context.cancelGesturesWithTouches('tap', touches);
				}

				if(preventDefault) {
					event.preventDefault();
				}
			},
			update: function(event, data) {
				countTouches = event.touches && event.touches.length > countTouches ? event.touches.length : countTouches;
				if(countTouches > 0 && countTouches > touches) {
					inst.context.cancelGesturesWithTouches('tap', touches);
				}
				/*
				 * Maybe handle in/out
				 */
				if(preventDefault) {
					event.preventDefault();
				}
			},
			end: function(event, data) {
				if(countTouches > 0 && countTouches !== touches) {
					return;
				}
				if(this.rect.pointInside(data.points[0], this.options.areaThreshold)) {
					gesture.end.call(this, event, data);
				}
				if(preventDefault) {
					event.preventDefault();
				}
			}
		}));
		return G;
	};

	/**
	 * Bind a doubletap event, used for basic interaction. Supports a area threshold for easier interaction
	 * on mobile devices. Triggers `start`, `update` and `end` events.
	 * @name G#doubletap
	 * @param {DOMElement} elem
	 * @param {Object} Data to set up the gesture
	 */
	G.doubletap = function(elem, gesture) {
		gesture = G.utils.extend({
			options: {
				areaThreshold: 5,
				timeThreshold: 500,
				precedence: 5,
				preventDefault: true
			},
			start: function() {},
			update: function() {},
			end: function() {}
		}, gesture);

		var count = 0,
			startTime, endTime, timeThreshold = gesture.options.timeThreshold,
			timerId, preventDefault = gesture.options.preventDefault;

		return G.tap(elem, {
			end: function(event, data) {
				++count;
				if(count === 1) {
					startTime = +new Date();
					timerId = setTimeout(function() {
						count = 0;
					}, timeThreshold + 50);
				} else if(count === 2) {
					clearTimeout(timerId);
					endTime = +new Date();
					if((startTime + timeThreshold) >= endTime) {
						gesture.end.call(this, event, data);
					}
					count = 0;
				}

				if(preventDefault) {
					event.preventDefault();
				}
			}
		});
	};

	/**
	 * Bind a swipe gesture. Supports a radius threshold that is used to measure when the gesture starts.
	 * Triggers `start`, `update` and `end` events.
	 * @name G#swipe
	 * @param {DOMElement} elem
	 * @param {Object} Data to set up the gesture
	 */
	G.swipe = function(elem, gesture) {
		gesture = G.utils.extend({
			options: {
				radiusThreshold: 12,
				preventDefault: true
			},
			start: function() {},
			update: function() {},
			end: function() {}
		}, gesture);

		var inst = G.cache.get(elem),
			radiusThreshold = gesture.options.radiusThreshold,
			preventDefault = gesture.options.preventDefault,
			countTouches, touches = 1;

		inst.context.addGesture(G.gesture(elem, 'swipe', {
			options: gesture.options,
			getSwipe: function(point) {
				this.swipe.currentPoint = point;
				this.swipe.currentTime = +new Date();
				this.swipe.deltaX = this.swipe.currentPoint.x - this.swipe.startPoint.x;
				this.swipe.deltaY = this.swipe.currentPoint.y - this.swipe.startPoint.y;
				this.swipe.velocity = G.utils.getVelocity(this.swipe.startPoint, this.swipe.currentPoint, this.swipe.startTime, this.swipe.currentTime);
				this.swipe.angle = G.utils.getAngle(this.swipe.startPoint, this.swipe.currentPoint);
				this.swipe.direction = G.utils.getDirection(this.swipe.angle);
				this.swipe.elementDistance = this.swipe.direction === 'left' || this.swipe.direction === 'right' ? this.rect.width : this.rect.height;
				this.swipe.distance = this.swipe.direction === 'left' || this.swipe.direction === 'right' ? abs(this.swipe.deltaX) : abs(this.swipe.deltaY);
				this.swipe.percentage = this.swipe.distance / this.swipe.elementDistance * 100;
				return this.swipe;
			},
			start: function(event, data) {
				this.swipe = {};
				this.swipestartFired = false;

				countTouches = 0;
				countTouches = event.touches && event.touches.length > countTouches ? event.touches.length : 1;
				if(countTouches !== touches) {
					inst.context.cancelGestures('swipe');
					return;
				}

				this.swipe.startPoint = data.points[0];
				this.swipe.startTime = +new Date();

				if(preventDefault) {
					event.preventDefault();
				}
			},
			update: function(event, data) {
				countTouches = event.touches && event.touches.length > countTouches ? event.touches.length : 1;
				if(countTouches !== touches) {
					inst.context.cancelGestures('swipe');
					return;
				}

				data.swipe = this.getSwipe(data.points[0]);

				if(!this.swipestartFired && this.swipe.startPoint.distanceTo(this.swipe.currentPoint) >= radiusThreshold) {
					inst.context.cancelGestures('tap').cancelGestures('rotate');
					this.swipestartFired = true;
					gesture.start.call(this, event, data);
				} else if(this.swipestartFired) {
					gesture.update.call(this, event, data);
				}

				this.swipe.startTime = this.swipe.currentTime; //to calculate correct velocity
				if(preventDefault) {
					event.preventDefault();
				}
			},
			end: function(event, data) {
				if(this.swipestartFired) {
					gesture.end.call(this, event, data);
				}

				if(preventDefault) {
					event.preventDefault();
				}
			}
		}));
		return G;
	};

	G.rotate = function(elem, gesture) {
		gesture = G.utils.extend({
			options: {
				rotationThreshold: 12,
				preventDefault: true
			},
			start: function() {},
			update: function() {},
			end: function() {}
		}, gesture);

		var inst = G.cache.get(elem),
			touches = 2,
			preventDefault = gesture.options.preventDefault,
			rotationThreshold = gesture.options.rotationThreshold,
			startAngle, currentAngle,
			rotation, countTouches;

		inst.context.addGesture(G.gesture(elem, 'rotate', {
			options: gesture.options,
			start: function(event, data) {
				this.rotate = {
					start: {},
					current: {}
				};
				this.rotationstartFired = false;

				countTouches = 0;
				countTouches = event.touches && event.touches.length > countTouches ? event.touches.length : 1;
				if(countTouches > 0 && countTouches > touches) {
					inst.context.cancelGestures('rotate');
					return;
				}

				this.rotate.start.point1 = data.points[0];
				this.rotate.start.point2 = data.points[1];

				if(preventDefault) {
					event.preventDefault();
				}
			},
			update: function(event, data) {
				countTouches = event.touches && event.touches.length > countTouches ? event.touches.length : countTouches;
				if(countTouches > 0 && countTouches > touches) {
					inst.context.cancelGestures('rotate');
					return;
				} else if(countTouches === touches) {
					if(!this.rotate.start.point2) {
						this.rotate.start.point2 = data.points[1];
					} else {
						this.rotate.current.point1 = data.points[0];
						this.rotate.current.point2 = data.points[1];
						startAngle = G.utils.getDeltaAngle(this.rotate.start.point2, this.rotate.start.point1);
						currentAngle = G.utils.getDeltaAngle(this.rotate.current.point2, this.rotate.current.point1);
						rotation = currentAngle - startAngle;
						data.rotation = rotation;

						if(!this.rotationstartFired && rotation >= rotationThreshold) {
							this.rotationstartFired = true;
							inst.context.cancelGestures('tap').cancelGestures('swipe');
							gesture.start.call(this, event, data);
						} else if(this.rotationstartFired) {
							gesture.update.call(this, event, data);
						}
					}
				}

				if(preventDefault) {
					event.preventDefault();
				}
			},
			end: function(event, data) {
				if(this.rotationstartFired) {
					gesture.end.call(this, event, data);
				}

				if(preventDefault) {
					event.preventDefault();
				}
			}
		}));
		return G;
	};
})();