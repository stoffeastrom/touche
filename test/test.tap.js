/*global describe, Touche, expect, it, beforeEach*/
describe('Gesture', function () {
	var body = document.body;

	describe('#Tap', function () {
		var el = document.createElement('div');
		el.style.position = "absolute";
		el.style.top = "0px";
		el.style.left = "0px";
		el.style.width = "100px";
		el.style.height = "100px";
		body.appendChild(el);

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
			Touche.simulate.gesture(el);
		});

		it('should get called when tapping in center point', function () {
			expect(this.called).to.be(true);
		});

		it('should not be cancelled when tapping in center point', function () {
			expect(this.cancelled).to.be(false);
		});

		/*point = new Touche.Point(elRect.x - 20, elRect.y);
		Touche.simulate.gesture(el, [point]);

		it('should be cancelled when tapping outside element and areaThreshold', function() {
			expect(cancelled).to.be(true);
		});

		Touche.cache.get(el).context.removeGestures('tap');*/
	});
});