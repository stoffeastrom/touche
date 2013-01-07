/*global describe, before, beforeEach, after, Touche, expect, it */
describe('Gestures, combined', function() {
	var body = document.body;

	describe('#Tap, #Longtap, #Doubletap, bound on same element - Mouse', function () {
		var el, origUtilsMSPointer, origUtilsTouch;

		before(function() {
			origUtilsTouch = Touche.utils.touch;
			origUtilsMSPointer = Touche.utils.msPointer;
			Touche.utils.touch = false;
			Touche.utils.msPointer = false;

			el = document.createElement('div');
			el.style.position = "absolute";
			el.style.top = "0px";
			el.style.left = "0px";
			el.style.width = "100px";
			el.style.height = "100px";
			body.appendChild(el);
		});

		beforeEach(function () {
			var context = this,
				gestures = context.gestures = {};
			gestures.tap = {
				called: false,
				gesture: {
					end: function() {
						gestures.tap.called = true;
					}
				}
			};
			gestures.doubletap = {
				called: false,
				gesture: {
					options: {
						timeThreshold: 200
					},
					end: function() {
						gestures.doubletap.called = true;
					}
				}
			};
			gestures.longtap = {
				started: false,
				updated: false,
				called: false,
				cancelled: false,
				gesture: {
					options: {
						timeThreshold: 400
					},
					start: function() {
						gestures.longtap.started = true;
					},
					update: function() {
						gestures.longtap.updated = true;
					},
					end: function() {
						gestures.longtap.called = true;
					},
					cancel: function() {
						gestures.longtap.cancelled = true;
					}
				}
			};
			Touche(el)
				.tap(gestures.tap.gesture)
				.doubletap(gestures.doubletap.gesture)
				.longtap(gestures.longtap.gesture);
		});

		it('should trigger longtap start/update/cancel, tap', function (done) {
			var context = this;
			context.timeout(500);
			Touche.simulate.gesture(el, null, {
				mouse: ['down']
			}, 'mouse');
			setTimeout(function() {
				Touche.simulate.gesture(el, null, {
					mouse: ['up']
				}, 'mouse');
				setTimeout(function() {
					expect(context.gestures.longtap.started).to.be(true);
					expect(context.gestures.longtap.updated).to.be(true);
					expect(context.gestures.longtap.called).to.be(false);
					expect(context.gestures.longtap.cancelled).to.be(true);
					expect(context.gestures.tap.called).to.be(true);
					expect(context.gestures.doubletap.called).to.be(false);
					done();
				}, 250);
			}, 100);
		});

		/*it('should trigger doubletap', function (done) {
			var context = this;
			context.timeout(500);
			Touche.simulate.gesture(el, null, {
				mouse: ['down']
			}, 'mouse');
			setTimeout(function() {
				Touche.simulate.gesture(el, null, {
					mouse: ['up']
				}, 'mouse');
				setTimeout(function() {
					Touche.simulate.gesture(el, null, {
						mouse: ['down']
					}, 'mouse');
					setTimeout(function() {
						Touche.simulate.gesture(el, null, {
							mouse: ['up']
						}, 'mouse');
						
						done();
					}, 10);
				}, 10);
			}, 10);
		});*/

		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche.utils.msPointer = origUtilsMSPointer;
			Touche(el).off();
			expect(Touche.cache.data.length).to.be(0);
			body.removeChild(el);
		});
	});
});