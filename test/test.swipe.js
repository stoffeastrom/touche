/*global describe, Touche, expect, it, before, beforeEach, after*/
describe('Gesture', function () {
	var body = document.body;

	describe('#Swipe', function () {
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
			context.started = false;
			context.updated = false;
			context.called = false;
			context.cancelled = false;
			context.gesture = {
				options: {
					radiusThreshold: 8
				},
				start: function() {
					context.started = true;
				},
				update: function() {
					context.updated = true;
				},
				end: function () {
					context.called = true;
				},
				cancel: function () {
					context.cancelled = true;
				}
			};
			Touche(el).swipe(context.gesture);
		});

		it('should get called when swiping and radius threshold is met', function (done) {
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], {
				mouse: ['down'],
				touch: ['start']
			});
			Touche.simulate.gesture(el, [new Touche.Point(60,50)], {
				mouse: ['move'],
				touch: ['move']
			});
			Touche.simulate.gesture(el, [new Touche.Point(61,51)], {
				mouse: ['move'],
				touch: ['move']
			});
			Touche.simulate.gesture(el, [new Touche.Point(60,60)], {
				mouse: ['up'],
				touch: ['end']
			});
			expect(this.started).to.be(true);
			expect(this.updated).to.be(true);
			expect(this.called).to.be(true);
			expect(this.cancelled).to.be(false);
			done();
		});

		it('should not get called when swiping and radius threshold is not met', function (done) {
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], {
				mouse: ['down'],
				touch: ['start']
			});
			Touche.simulate.gesture(el, [new Touche.Point(55,50)], {
				mouse: ['move'],
				touch: ['move']
			});
			Touche.simulate.gesture(el, [new Touche.Point(56,51)], {
				mouse: ['move'],
				touch: ['move']
			});
			Touche.simulate.gesture(el, [new Touche.Point(55,55)], {
				mouse: ['up'],
				touch: ['end']
			});
			expect(this.started).to.be(false);
			expect(this.updated).to.be(false);
			expect(this.called).to.be(false);
			expect(this.cancelled).to.be(false);
			done();
		});

		after(function() {
			Touche.cache.get(el).context.removeGestures('swipe');
			body.removeChild(el);
		});
	});
});