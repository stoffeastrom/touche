/*global describe, Touche, expect, it, before, beforeEach, after*/
describe('Gesture', function () {
	var body = document.body;

	describe('#LongTap', function () {
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
					timeThreshold: 200
				},
				end: function () {
					context.called = true;
				},
				cancel: function () {
					context.cancelled = true;
				}
			};
			Touche.longtap(el, context.gesture);
		});

		it('should get called when tapping in center point and time threshold is met', function (done) {
			this.timeout(250);
			var context = this;
			Touche.simulate.gesture(el, null, {
				mouse: ['down'],
				touch: ['start']
			}, null, null);
			setTimeout(function() {
				Touche.simulate.gesture(el, null, {
					mouse: ['up'],
					touch: ['end']					
				}, null, null);
				expect(context.called).to.be(true);
				expect(context.cancelled).to.be(false);
				done();
			}, 225);
		});

		after(function() {
			Touche.cache.get(el).context.removeGestures('tap');
			body.removeChild(el);
		});
	});
});