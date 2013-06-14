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