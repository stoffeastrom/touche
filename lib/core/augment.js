(function (fnProto) {
	'use strict';
	fnProto.augment = function (classFn) {
		var _super = this.prototype,
			prototype = Object.create(_super),
			constructor = classFn.call(prototype, this, _super);
		if (typeof constructor !== 'function') {
			constructor = function () {};
		}
		prototype.constructor = constructor;
		constructor.prototype = prototype;
		return constructor;
	};
})(Function.prototype);