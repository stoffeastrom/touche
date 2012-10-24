(function () {
	'use strict';

	var T = window.Touche;

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
			event[touchList] = [];
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
				cancelable: (type !== "mousemove"),
				view: window,
				detail: 0,

				screenX: points[0].x,
				screenY: points[0].y,
				clientX: points[0].x,
				clientY: points[0].y,

				ctrlKey: false,
				altKey: false,
				shiftKey: false,
				metaKey: false,

				button: 0,
				relatedTarget: undefined

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
			elem.dispatchEvent(event);
			return event;
		},
		gesture: function (target, points, prefix, touchList) {
			target = target || window.document.body;
			prefix = prefix || 'mouse';
			touchList =  touchList || 'touches';
			/*
			 * This will handle all the logic to simulate a gesture
			 */
			var createEvent = this._createEvent,
				event,
				events = {
				mouse: ['down', 'move', 'up'],
				touch: ['start', 'move', 'end']
			},
				rect = T.getRect(target),
				centerPoint = new T.Point((rect.x + rect.width) / 2, (rect.y + rect.height) / 2);

			points = points || [centerPoint];

			events[prefix].forEach(function(suffix) {
				event = createEvent(prefix + suffix, touchList, points);
				console.log(target, event, prefix, suffix, touchList, points);
				T.simulate._dispatchEvent(target, event);
			});
		}
	};
})();