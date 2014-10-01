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
			if(T.utils.pointerEnabled) {
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
			if(T.utils.pointerEnabled) {
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

		this.handleEvent = function(event) {
			switch(event.type) {
				case "mousedown":
				case "touchstart":
				case "MSPointerDown":
				case "pointerdown":
					this.onStart( event );
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
