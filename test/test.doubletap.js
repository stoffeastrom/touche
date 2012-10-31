/*global describe, Touche, expect, it, before, beforeEach, after*/
describe('Gesture', function () {
	var body = document.body;

	describe('#DoubleTap', function () {
		var el;

		before(function() {
			console.log("before");
			el = document.createElement('div');
			el.style.position = "absolute";
			el.style.top = "0px";
			el.style.left = "0px";
			el.style.width = "100px";
			el.style.height = "100px";
			body.appendChild(el);
		});

		beforeEach(function () {
			console.log("beforeEach");
			var context = this;
			context.called = false;
			context.cancelled = false;
			context.gesture = {
				options: {
					areaThreshold: 5,
					timeThreshold: 10000
				},
				end: function () {
					context.called = true;
				},
				cancel: function () {
					context.cancelled = true;
				}
			};
			Touche.doubletap(el, context.gesture);
		});

		it('should get called when tapping in center point', function () {
			Touche.simulate.gesture(el);
			Touche.simulate.gesture(el);
			expect(this.called).to.be(true);
			expect(this.cancelled).to.be(false);
		});

		after(function() {
			console.log("after");
			body.removeChild(el);
		});
	});
});