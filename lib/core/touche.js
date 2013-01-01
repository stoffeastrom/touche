(function() {
	'use strict';

	var T,
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

	T.prototype.on = function(type, bindingObj) {
		T.prototype[type].call(this,bindingObj);
		return this;
	};
	T.prototype.off = function(type) {
		this.cache.context.gestures.filter(function(gesture) {
			return gesture.type === type;
		}).forEach(function(gesture) {
			gesture.off(this.elem);
		}, this);
		this.cache.context.removeGestures(type);
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
		add: function(type, gesture) {
			T._gestures[type] = gesture;
			T.prototype[type] = function(bindingObj) {
				bindingObj = T.utils.extend({
					options: gesture.options || {},
					start: function(){},
					update: function(){},
					end: function(){},
					cancel: function(){}
				}, bindingObj);
				var g = new T.Gesture(this.cache.context, this.elem, type, bindingObj);

				T.utils.extend(g, gesture);
				this.cache.context.addGesture(g);
				g.on(this.elem);
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

	/**
	 * Represents a handler for gestures, used to set up basic structure for creating gestures.
	 * @name T.GestureHandler
	 * @todo Move this into its own file? It's kind of large.
	 * @class
	 * @param {DOMElement} element The element attached to the {@link T.GestureHandler}
	 */
	T.GestureHandler = function(element) {
		this.element = element;
		this.gestures = [];
		this.sortedGestures = [];
		this.data = {};
		this.data.points = [];
		this.data.pointerIds = [];
		this.pausedCallbacks = [];
	};

	T.GestureHandler.prototype.activate = function() {
		this.on(this.element, T.utils.getEvents().start);
	};

	T.GestureHandler.prototype.deactivate = function() {
		this.off(this.element, T.utils.getEvents().start);
		this.bindDoc(false);
		T.cache.remove(this.element);
	};

	T.GestureHandler.prototype.on = function(element, event) {
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

	T.GestureHandler.prototype.off = function(element, event) {
		element.removeEventListener(event, this, false);
		if(T.utils.msPointer) {
			if(element.style) {
				element.style.msTouchAction = this.msTouchAction;
			}
		}
	};

	T.GestureHandler.prototype.reset = function() {
		this.data.pointerIds = [];
		this.gestures.forEach(function(gesture) {
			gesture.started = false;
			gesture.cancelled = false;
			gesture.countTouches = 0;
		});
	};

	T.GestureHandler.prototype.trigger = function(action, event, data) {
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

	T.GestureHandler.prototype.play = function(trigger) {
		trigger = trigger || false;

		this.pausedCallbacks.forEach(function(obj) {
			if(trigger && !obj.gesture.cancelled) {
				obj.gesture[obj.action].call(obj.gesture, obj.event, obj.data);
			} else if(!obj.gesture.cancelled) {
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

	T.GestureHandler.prototype.pause = function(type, excludeGesture) {
		this.gestures.filter(function(gesture) {
			return excludeGesture !== gesture && type === gesture.type;
		}).forEach(function(gesture) {
			gesture.pause();
			gesture.paused = true;
		});
	};

	T.GestureHandler.prototype.addPausedCallback = function(gesture, action, event, data) {
		this.pausedCallbacks.push({
			gesture: gesture,
			action: action,
			event: event,
			data: data
		});
	};

	T.GestureHandler.prototype.addGesture = function(gesture) {
		this.gestures.push(gesture);
		this.sortGestures();

		if(this.gestures.length === 1) {
			this.activate();
		}
	};

	T.GestureHandler.prototype.removeGesture = function(gesture) {
		this.gestures = this.gestures.filter(function(obj) {
			return obj !== gesture;
		});
		this.sortGestures();

		if(this.gestures.length === 0) {
			this.deactivate();
		}
	};

	T.GestureHandler.prototype.removeGestures = function(type) {
		this.gestures.filter(function(obj) {
			if(type) {
				return obj.type === type;
			}
			return true;
		}).forEach(function(gesture) {
			this.removeGesture(gesture);
		}, this);
	};

	T.GestureHandler.prototype.cancelGesture = function(gesture) {
		if(!gesture.cancelled) {
			gesture.cancelled = true;
			gesture.cancel.call(gesture);
		}
	};

	T.GestureHandler.prototype.cancelGestures = function(type) {
		this.gestures.filter(function(obj) {
			return obj.type === type;
		}).forEach(function(gesture) {
			this.cancelGesture(gesture);
		}, this);
		return this;
	};

	T.GestureHandler.prototype.cancelGesturesWithProps = function(props, excludeGesture) {
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

	T.GestureHandler.prototype.sortGestures = function() {
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

	T.GestureHandler.prototype.bindDoc = function(on) {
		this[on ? 'on' : 'off'](doc, T.utils.getEvents().move);
		this[on ? 'on' : 'off'](doc, T.utils.getEvents().end);
	};

	T.GestureHandler.prototype.handleEvent = function(event) {
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

	T.GestureHandler.prototype.setPoints = function(event, touchList) {
		touchList = touchList || 'touches';

		var i, len, touches, pointerId, index;

		if(T.utils.touch) {
			touches = event[touchList];
			len = touches.length;
			
			for(i = 0; i < len; ++i) {
				this.data.points.length = len;
				this.data.points[i] = T.utils.transformPoint(event.target, new T.Point(touches[i].pageX, touches[i].pageY));
			}
		} else if(T.utils.msPointer) {
			pointerId = event.pointerId;
			index = this.data.pointerIds.indexOf(pointerId);
			if(index < 0 ) {
				index = this.data.pointerIds.push(pointerId) -1;
			}
			len = this.data.pointerIds.length;
			this.data.points.length = len;
			this.data.points[index] = T.utils.transformPoint(event.target, new T.Point(event.pageX, event.pageY));
		} else {
			this.data.points.length = 1;
			this.data.points[0] = T.utils.transformPoint(event.target, new T.Point(event.pageX, event.pageY));
		}
	};

})();