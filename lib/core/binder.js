(function(T) {
	'use strict';
	T.Binder = Object.augment(function () {
		this.start = T.utils.noop;
		this.update = T.utils.noop;
		this.end = T.utils.noop;
		this.cancel = T.utils.noop;
		this.bind = function (obj) {
			Object.keys(obj || {}).forEach(function (key) {
				this[key] = obj[key];
			}, this);
		};

		function Binder(obj) {
			this.bind(obj);
		}
		return Binder;
	});
})(window.Touche);