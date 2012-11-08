/*global describe, Touche, expect, it, before, beforeEach, after*/
describe('Gesture', function () {
	var body = document.body;

	describe('#2FingerTap', function () {
		var el, origUtilsTouch;

		before(function() {
			origUtilsTouch = Touche.utils.touch;
			Touche.utils.touch = true;
			
			el = document.createElement('div');
			el.style.position = "absolute";
			el.style.top = "0px";
			el.style.left = "0px";
			el.style.width = "100px";
			el.style.height = "100px";
			body.appendChild(el);
		});

		beforeEach(function () {
			var context = this;
			context.called = false;
			context.cancelled = false;
			context.gesture = {
				options: {
					touches: 2
				},
				end: function () {
					context.called = true;
				},
				cancel: function () {
					context.cancelled = true;
				}
			};
			Touche(el).tap(context.gesture);
		});

		it('should get called when tapping in center point with 2 finger', function (done) {
		Touche.simulate.gesture(el, [new Touche.Point(50,50), new Touche.Point(50,50)], null, 'touch');
			expect(this.called).to.be(true);
			expect(this.cancelled).to.be(false);
			done();
		});

		it('should not get called when tapping in center point with 3 fingers', function (done) {
		Touche.simulate.gesture(el, [new Touche.Point(50,50), new Touche.Point(50,50), new Touche.Point(50,50)], null, 'touch');
			expect(this.called).to.be(false);
			expect(this.cancelled).to.be(true);
			done();
		});

		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche.cache.get(el).context.removeGestures('tap');
			body.removeChild(el);
		});
	});
});