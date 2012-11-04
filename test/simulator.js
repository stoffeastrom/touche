(function () {
	'use strict';

	var T = window.Touche,
		origHandleEvent = T.GestureController.prototype.handleEvent;

    T.GestureController.prototype.handleEvent = function(e) {
        if (e.isSimulated) {
            origHandleEvent.apply(this, arguments);
        }
    };

	T.simulate = {
		_createTouchEvent: function (type, touchList, points) {
			touchList = touchList || 'touches';

			var event = document.createEvent('UIEvent');
			event.initUIEvent(type, true, true);

			event.view = window;
			event.altKey = false;
			event.ctrlKey = false;
			event.shiftKey = false;
			event.metaKey = false;
			event.touches = [];
			event.changedTouches = [];
			points.forEach(function (point) {
				event[touchList].push({
					pageX: point.x,
					pageY: point.y
				});
			});

			return event;
		},
		_createMouseEvent: function (type, touchList, points) {
			var event, e = {

				bubbles: true,
				cancelable: true, //(type !== "mousemove"),
				view: window,
				detail: 0,

				screenX: points[0].x,
				screenY: points[0].y,
				clientX: points[0].x - window.scrollX,
				clientY: points[0].y - window.scrollY,

				ctrlKey: false,
				altKey: false,
				shiftKey: false,
				metaKey: false,

				button: 0,
				relatedTarget: null

			};

			event = document.createEvent("MouseEvents");
			event.initMouseEvent(type, e.bubbles, e.cancelable, e.view, e.detail, e.screenX, e.screenY, e.clientX, e.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button, document.body.parentNode);

			return event;
		},
		_createEvent: function (type, touchList, points) {
			if (type.indexOf('touch') === 0) {
				return T.simulate._createTouchEvent(type, touchList, points);
			} else {
				return T.simulate._createMouseEvent(type, touchList, points);
			}
		},
		_dispatchEvent: function (elem, event) {
			event.isSimulated = true;
			elem.dispatchEvent(event);
			return event;
		},
		gesture: function (target, points, events, prefix, touchList) {
			target = target || window.document.body;
			events = events || {
				mouse: ['down', 'move', 'up'],
				touch: ['start', 'move', 'end']
			};
			prefix = prefix || ('ontouchstart' in window) ? 'touch' : 'mouse';
			touchList =  touchList || 'touches';
			/*
			 * This will handle all the logic to simulate a gesture
			 */
			var createEvent = this._createEvent,
				event,
				rect = T.getRect(target),
				centerPoint = new T.Point((rect.x + rect.width) / 2, (rect.y + rect.height) / 2);

			points = points || [centerPoint];

			events[prefix].forEach(function(suffix) {
				event = createEvent(prefix + suffix, touchList, points);
				T.simulate._dispatchEvent(target, event);
			});
		}
	};
})();