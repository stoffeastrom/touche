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
			// We reset the flow if the flowType is mouse as a workaround to the issue that IE does not trigger mouseup when clicking on a scrollbar:
			// http://social.msdn.microsoft.com/Forums/vstudio/en-US/3749b8a1-53ef-48fe-be81-b2df39d6154f/mouseup-event-of-vertical-scroll-bar?forum=netfxjscript
			this.resetFlowTypes(flowType === 'mouse');
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
