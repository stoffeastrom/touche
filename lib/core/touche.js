(function() {
	'use strict';

	var T;

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
		this.gestureHandler = T.cache.get(elem);
	};

	T.prototype.on = function(type, binder) {
		T.prototype[type].call(this, binder);
		return this;
	};
	
	T.prototype.off = function(type, id) {
		this.gestureHandler.gestures.filter(function(gesture) {
			return (type && type !== '*' && id) ?
						(gesture.type === type && gesture.id === id) :
						(type && type === '*' && id) ?
							(gesture.id === id) :
							type ?
								(gesture.type === type) :
								true;
		}).forEach(function(gesture) {
			gesture.off(this.elem);
			this.gestureHandler.removeGesture(gesture);
		}, this);
		if(this.gestureHandler.gestures.length === 0 && T.cache.data.length === 1) { //.off() was called without binding, make sure to clean up
			T.cache.remove(this.elem);
		}
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
		add: function(type, Gesture) {
			T._gestures[type] = Gesture;
			T.prototype[type] = function(binder) {
				var gestureInst,
					binderInst = new T.Binder(binder);
				gestureInst = new Gesture(this.gestureHandler, type, binderInst);
				this.gestureHandler.addGesture(gestureInst);
				gestureInst.on(this.elem);
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
})();