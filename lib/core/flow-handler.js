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
		 * Help function for detectTapOnScrollbar. Returns the width of the borders.
		 * @param {Element} element The element to get the border width from
		 * @returns {Object} An object with the following properties:
		 *                     - {Number} left		The left border width
		 *                     - {Number} top		The top border width
		 *                     - {Number} right		The right border width
		 *                     - {Number} bottom	The bottom border width
		 */
		function getWidthOfBorders( element ) {
			var borderWidths = {};
			
			function computeStyle( property ) {
				return parseInt( window.getComputedStyle( element ).getPropertyValue( property ) );
			}

			borderWidths.left = computeStyle( 'border-left-width' );
			borderWidths.top = computeStyle( 'border-top-width' );
			borderWidths.right = computeStyle( 'border-right-width' );
			borderWidths.bottom = computeStyle( 'border-bottom-width' );

			return borderWidths;
		}

		/**
		 * Help function for the detectTapOnScrollbar function. It returns the tap point
		 * relative the element that was tapped.
		 * @param {Number} pageX The pageX property from either the event or a touch object in the event
		 * @param {Number} pageY The pageY property from either the event or a touch object in the event
		 * @param {Element} element The element that was tapped
		 * @return {Object} An object with the following properties:
		 *                    - {Number} x The x position of the tap relative the element
		 *                    - {Number} y The y position of the tap relative the element
		 */
		function getTapPointInElement( pageX, pageY, element ) {
			return {
				x: pageX - element.offsetLeft,
				y: pageY - element.offsetTop
			};
		}

		/**
		 * Detects tapping on a scrollbar. If there are more than one touch in the
		 * event it will return true if at least one touch is on a scrollbar.
		 * @param {Event} event The event that was triggered by the tap
		 * @return {Boolean} true if a scrollbar was tapped else false
		 */
		function detectTapOnScrollbar(event) {
			if (event.target.clientHeight === 0 || event.target.clientWidth === 0) {
				// No dimensions of the element so there is no scrollbar
				return false;
			}

			var borders = getWidthOfBorders( event.target ),
				offsetWidth = event.target.offsetWidth - borders.left - borders.right,
				clientWidth = event.target.clientWidth,
				offsetHeight = event.target.offsetHeight - borders.top - borders.bottom,
				clientHeight = event.target.clientHeight,
				tapOnVerticalScrollbar = false,
				tapOnHorizontalScrollbar = false,
				offset;
			
			if (event.touches) {
				// There could be multiple touches so we check each of them
				for ( var i=0; i<event.touches.length; i++ ) {
					offset = getTapPointInElement( event.touches[i].pageX, event.touches[i].pageY, event.target );
					tapOnVerticalScrollbar = tapOnVerticalScrollbar || ( offsetWidth > clientWidth && offset.x > clientWidth );
					tapOnHorizontalScrollbar = tapOnHorizontalScrollbar || ( offsetHeight > clientHeight && offset.y > clientHeight );
				}
			} else {
				offset = getTapPointInElement( event.pageX, event.pageY, event.target );
				tapOnVerticalScrollbar = offsetWidth > clientWidth && offset.x > clientWidth;
				tapOnHorizontalScrollbar = offsetHeight > clientHeight && offset.y > clientHeight;
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
