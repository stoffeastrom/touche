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
