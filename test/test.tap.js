/*global describe, Touche, expect, it, before, beforeEach, after*/
describe('Gesture', function () {
	var body = document.body;

	describe('#Tap - Mouse', function () {
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
					areaThreshold: 5
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

		it('should get called when tapping in center point, for mouse events', function (done) {
			Touche.simulate.gesture(el);
			expect(this.called).to.be(true);
			expect(this.cancelled).to.be(false);
			done();
		});

		it('should be cancelled when tapping outside element and areaThreshold, for mouse events', function(done) {
			Touche.simulate.gesture(el, [new Touche.Point(200,200)]);
			expect(this.cancelled).to.be(true);
			done();
		});

		after(function() {
			Touche(el).off('tap');
			expect(Touche.cache.data.length).to.be(0);
			body.removeChild(el);
		});
	});

	describe('#Tap - Touch', function () {
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
					areaThreshold: 5
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

		it('should get called when tapping in center point, for touch events', function (done) {
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], null, 'touch');
			expect(this.called).to.be(true);
			expect(this.cancelled).to.be(false);
			done();
		});

		it('should be cancelled when tapping outside element and areaThreshold, for touch events', function(done) {
			Touche.simulate.gesture(el, [new Touche.Point(200,200)], null, 'touch');
			expect(this.cancelled).to.be(true);
			done();
		});

		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche(el).off('tap');
			expect(Touche.cache.data.length).to.be(0);
			body.removeChild(el);
		});
	});

	describe('#Tap - MSPointer', function () {
		var el, origUtilsMSPointer, origUtilsTouch;

		before(function() {
			origUtilsTouch = Touche.utils.touch;
			origUtilsMSPointer = Touche.utils.msPointer;
			Touche.utils.touch  = false;
			Touche.utils.msPointer = true;

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
					areaThreshold: 5
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

		it('should get called when tapping in center point, for ms pointer events', function (done) {
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], null, 'MSPointer');
			expect(this.called).to.be(true);
			expect(this.cancelled).to.be(false);
			done();
		});

		it('should be cancelled when tapping outside element and areaThreshold, for ms pointer events', function(done) {
			Touche.simulate.gesture(el, [new Touche.Point(200,200)], null, 'MSPointer');
			expect(this.cancelled).to.be(true);
			done();
		});

		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche.utils.msPointer = origUtilsMSPointer;
			Touche(el).off('tap');
			expect(Touche.cache.data.length).to.be(0);
			body.removeChild(el);
		});
	});
});