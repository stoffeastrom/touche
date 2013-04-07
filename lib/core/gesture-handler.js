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

		this.reset = function(event) {
			var type = T.utils.getFlowType(event),
				data = this.data[type];

			this.gestures.forEach(function(gesture) {
				gesture.started = false;
				gesture.cancelled = false;
				gesture.countTouches = 0;
			});

			data = {};
			data.points = [];
			data.pointerIds = [];
			data.pagePoints = [];
			data.started = false;
			data.ended = false;
			data.relatedTarget = null;
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

		this.handleEvent = function(event) {
			var events = T.utils.getEvents(),
				flowType = T.utils.getFlowType(event.type),
				data = this.data[flowType];

			if(events.start.some(function(val) {
				return event.type === val;
			})) {
				if(data.started && data.ended) {
					this.reset(event.type);
				}
				this.bindDoc(true, event.type);
				data.relatedTarget = event.target;
				this.setPoints(event);
				this.trigger('start', event, data);
				data.started = true;
			} else if(events.update.some(function(val) {
				return event.type === val;
			})) {
				this.setPoints(event);
				this.trigger('update', event, data);
			} else if(events.end.some(function(val) {
				return event.type === val;
			})) {
				this.bindDoc(false, event.type);
				this.trigger('end', event, data);
				data.ended = true;
			} else if(events.cancel.some(function(val) {
				return event.type === val;
			})) {
				this.bindDoc(false, event.type);
				this.trigger('cancel', event, data);
				data.ended = true;
			}
		};

		this.setPoints = function(event, touchList) {
			touchList = touchList || 'touches';

			var i, len, touches, pointerId, index,
				data = this.data[T.utils.getFlowType(event.type)];

			if(T.utils.touch) {
				touches = event[touchList];
				len = touches.length;
				
				for(i = 0; i < len; ++i) {
					data.points.length = len;
					data.pagePoints.length = len;
					data.points[i] = T.utils.transformPoint(data.relatedTarget, new T.Point(touches[i].pageX, touches[i].pageY));
					data.pagePoints[i] = new T.Point(touches[i].pageX, touches[i].pageY);
				}
			} else if(T.utils.msPointer) {
				pointerId = event.pointerId;
				index = data.pointerIds.indexOf(pointerId);
				if(index < 0 ) {
					index = data.pointerIds.push(pointerId) -1;
				}
				len = data.pointerIds.length;
				data.points.length = len;
				data.pagePoints.length = len;
				data.points[index] = T.utils.transformPoint(data.relatedTarget, new T.Point(event.pageX, event.pageY));
				data.pagePoints[index] = new T.Point(event.pageX, event.pageY);
			} else {
				data.points.length = 1;
				data.pagePoints.length = 1;
				data.points[0] = T.utils.transformPoint(data.relatedTarget, new T.Point(event.pageX, event.pageY));
				data.pagePoints[0] = new T.Point(event.pageX, event.pageY);
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
