/*global describe, Touche, expect, it, before, beforeEach, after*/
describe('Gesture', function () {
	var body = document.body;

	describe('#DoubleTap', function () {
		var el;

		before(function() {
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
					timeThreshold: 100
				},
				end: function () {
					context.called = true;
				},
				cancel: function () {
					context.cancelled = true;
				}
			};
			Touche(el).doubletap(context.gesture);
		});

		it('should get called when tapping in center point', function (done) {
			Touche.simulate.gesture(el);
			Touche.simulate.gesture(el);
			expect(this.called).to.be(true);
			expect(this.cancelled).to.be(false);
			done();
		});

		it('should not be called when not inside time threshold', function (done) {
			this.timeout(250);
			var context = this;
			Touche.simulate.gesture(el);
			setTimeout(function() {
				Touche.simulate.gesture(el);
				expect(context.called).to.be(false);
				expect(context.cancelled).to.be(false);
				done();
			}, 200);
		});

		after(function() {
			Touche.cache.get(el).context.removeGestures('tap');
			body.removeChild(el);
		});
	});
});