/*global describe, Touche, expect, it, before, beforeEach, after*/
describe('Gesture', function () {
	var body = document.body;

	describe('#Tap', function () {
		var el;

		before(function() {
			el = document.createElement('div');
			el.style.position = "absolute";
			el.style.top = "0px";
			el.style.left = "0px";
			el.style.width = "100px";
			el.style.height = "100px";
			body.appendChild(el);
		})

		beforeEach(function () {
			var context = this;
			context.called = false;
			context.cancelled = false;
			context.gesture = {
				options: {
					areaThreshold: 5
				},
				end: function () {
					context.called = true;
				},
				cancel: function () {
					context.cancelled = true;
				}
			};
			Touche.tap(el, context.gesture);
		});

		it('should get called when tapping in center point', function () {
			Touche.simulate.gesture(el);
			expect(this.called).to.be(true);
			expect(this.cancelled).to.be(false);
		});

		it('should be cancelled when tapping outside element and areaThreshold', function() {
			Touche.simulate.gesture(el, [new Touche.Point(200,200)]);
			expect(this.cancelled).to.be(true);
		});

		after(function() {
			body.removeChild(el);
		});
	});
});