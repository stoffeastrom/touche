(function(T, doc){
	'use strict';

	/**
	 * Represents a handler for gestures, used to set up basic structure for creating gestures.
	 * @name T.GestureHandler
	 * @class
	 * @param {DOMElement} element The element attached to the {@link T.GestureHandler}
	 */
	T.GestureHandler = Object.augment(function() {


		this.activate = function() {
			this.on(this.element, T.utils.getEvents().start);
		};

		this.deactivate = function() {
			this.off(this.element, T.utils.getEvents().start);
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

		this.reset = function() {
			this.gestures.forEach(function(gesture) {
				gesture.started = false;
				gesture.cancelled = false;
				gesture.countTouches = 0;
			});
			this.data.pointerIds = [];
			this.data.points = [];
			this.started = false;
			this.ended = false;
		};

		this.trigger = function(action, event, data) {
			var gesture;
			this.sortedGestures.forEach(function(sorted) {
				gesture = sorted.context;
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
				if(type) {
					return obj.type === type;
				}
				return true;
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

		this.cancelGesturesWithProps = function(props, excludeGesture) {
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

		this.sortGestures = function() {
			var sorted = [];

			this.gestures.forEach(function(gesture){
				sorted.push({
					key: gesture.sortKey,
					context: gesture
				});
			}, this);

			sorted.sort(function(g1, g2) {
				return g1.key - g2.key;
			});

			this.sortedGestures = sorted;
		};

		this.bindDoc = function(on) {
			this[on ? 'on' : 'off'](doc, T.utils.getEvents().move);
			this[on ? 'on' : 'off'](doc, T.utils.getEvents().end);
		};

		this.handleEvent = function(event) {
			var events = T.utils.getEvents();

			switch(event.type) {
			case events.start:
				if(this.started && this.ended) {
					this.reset();
				}
				this.bindDoc(true);
				this.setPoints(event);
				this.trigger('start', event, this.data);
				this.started = true;
				break;
			case events.move:
				this.setPoints(event);
				this.trigger('update', event, this.data);
				break;
			case events.end:
				this.bindDoc(false);
				this.trigger('end', event, this.data);
				this.ended = true;
				break;
			}
		};

		this.setPoints = function(event, touchList) {
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

		function GestureHandler(element) {
			this.element = element;
			this.gestures = [];
			this.sortedGestures = [];
			this.data = {};
			this.data.points = [];
			this.data.pointerIds = [];
			this.started = false;
			this.ended = false;
		}
		return GestureHandler;
	});
})(window.Touche, window.document);