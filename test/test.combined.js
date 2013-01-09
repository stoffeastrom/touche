/*global describe, before, beforeEach, after, Touche, expect, it, afterEach */
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
			var context = this;
			context.gestures = {};

			context.gestures.tap = {
				called: false,
				gesture: {
					end: function() {
						context.gestures.tap.called = true;
					}
				}
			};
			context.gestures.doubletap = {
				called: false,
				gesture: {
					options: {
						timeThreshold: 200
					},
					end: function() {
						context.gestures.doubletap.called = true;
					}
				}
			};
			context.gestures.longtap = {
				started: false,
				updated: false,
				called: false,
				cancelled: false,
				gesture: {
					options: {
						timeThreshold: 400
					},
					start: function() {
						context.gestures.longtap.started = true;
					},
					update: function() {
						context.gestures.longtap.updated = true;
					},
					end: function() {
						context.gestures.longtap.called = true;
					},
					cancel: function() {
						context.gestures.longtap.cancelled = true;
					}
				}
			};
			Touche(el)
				.tap(context.gestures.tap.gesture)
				.doubletap(context.gestures.doubletap.gesture)
				.longtap(context.gestures.longtap.gesture);
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

		it('should trigger doubletap', function (done) {
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
						expect(context.gestures.longtap.started).to.be(false);
						expect(context.gestures.longtap.updated).to.be(false);
						expect(context.gestures.longtap.called).to.be(false);
						expect(context.gestures.longtap.cancelled).to.be(false);
						expect(context.gestures.tap.called).to.be(false);
						expect(context.gestures.doubletap.called).to.be(true);
						done();
					}, 10);
				}, 10);
			}, 10);
		});
		afterEach(function() {
			Touche(el).off();
			expect(Touche.cache.data.length).to.be(0);
		});
		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche.utils.msPointer = origUtilsMSPointer;
			body.removeChild(el);
		});
	});

	describe('#Tap, #Longtap, #Doubletap, bound on same element - Touch', function () {
		var el, origUtilsMSPointer, origUtilsTouch;

		before(function() {
			origUtilsTouch = Touche.utils.touch;
			origUtilsMSPointer = Touche.utils.msPointer;
			Touche.utils.touch = true;
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
			var context = this;
			context.gestures = {};

			context.gestures.tap = {
				called: false,
				gesture: {
					end: function() {
						context.gestures.tap.called = true;
					}
				}
			};
			context.gestures.doubletap = {
				called: false,
				gesture: {
					options: {
						timeThreshold: 200
					},
					end: function() {
						context.gestures.doubletap.called = true;
					}
				}
			};
			context.gestures.longtap = {
				started: false,
				updated: false,
				called: false,
				cancelled: false,
				gesture: {
					options: {
						timeThreshold: 400
					},
					start: function() {
						context.gestures.longtap.started = true;
					},
					update: function() {
						context.gestures.longtap.updated = true;
					},
					end: function() {
						context.gestures.longtap.called = true;
					},
					cancel: function() {
						context.gestures.longtap.cancelled = true;
					}
				}
			};
			Touche(el)
				.tap(context.gestures.tap.gesture)
				.doubletap(context.gestures.doubletap.gesture)
				.longtap(context.gestures.longtap.gesture);
		});

		it('should trigger longtap start/update/cancel, tap', function (done) {
			var context = this;
			context.timeout(500);
			Touche.simulate.gesture(el, null, {
				touch: ['start']
			}, 'touch');
			setTimeout(function() {
				Touche.simulate.gesture(el, null, {
					touch: ['end']
				}, 'touch');
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

		it('should trigger doubletap', function (done) {
			var context = this;
			context.timeout(500);
			Touche.simulate.gesture(el, null, {
				touch: ['start']
			}, 'touch');
			setTimeout(function() {
				Touche.simulate.gesture(el, null, {
					touch: ['end']
				}, 'touch');
				setTimeout(function() {
					Touche.simulate.gesture(el, null, {
						touch: ['start']
					}, 'touch');
					setTimeout(function() {
						Touche.simulate.gesture(el, null, {
							touch: ['end']
						}, 'touch');
						expect(context.gestures.longtap.started).to.be(false);
						expect(context.gestures.longtap.updated).to.be(false);
						expect(context.gestures.longtap.called).to.be(false);
						expect(context.gestures.longtap.cancelled).to.be(false);
						expect(context.gestures.tap.called).to.be(false);
						expect(context.gestures.doubletap.called).to.be(true);
						done();
					}, 10);
				}, 10);
			}, 10);
		});

		afterEach(function() {
			Touche(el).off();
			expect(Touche.cache.data.length).to.be(0);
		});
		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche.utils.msPointer = origUtilsMSPointer;
			body.removeChild(el);
		});
	});

	describe('#Tap, #Longtap, #Doubletap, bound on same element - MSPointer', function () {
		var el, origUtilsMSPointer, origUtilsTouch;

		before(function() {
			origUtilsTouch = Touche.utils.touch;
			origUtilsMSPointer = Touche.utils.msPointer;
			Touche.utils.touch = false;
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
			context.gestures = {};

			context.gestures.tap = {
				called: false,
				gesture: {
					end: function() {
						context.gestures.tap.called = true;
					}
				}
			};
			context.gestures.doubletap = {
				called: false,
				gesture: {
					options: {
						timeThreshold: 200
					},
					end: function() {
						context.gestures.doubletap.called = true;
					}
				}
			};
			context.gestures.longtap = {
				started: false,
				updated: false,
				called: false,
				cancelled: false,
				gesture: {
					options: {
						timeThreshold: 400
					},
					start: function() {
						context.gestures.longtap.started = true;
					},
					update: function() {
						context.gestures.longtap.updated = true;
					},
					end: function() {
						context.gestures.longtap.called = true;
					},
					cancel: function() {
						context.gestures.longtap.cancelled = true;
					}
				}
			};
			Touche(el)
				.tap(context.gestures.tap.gesture)
				.doubletap(context.gestures.doubletap.gesture)
				.longtap(context.gestures.longtap.gesture);
		});

		it('should trigger longtap start/update/cancel, tap', function (done) {
			var context = this;
			context.timeout(500);
			Touche.simulate.gesture(el, null, {
				MSPointer: ['Down']
			}, 'MSPointer');
			setTimeout(function() {
				Touche.simulate.gesture(el, null, {
					MSPointer: ['Up']
				}, 'MSPointer');
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

		it('should trigger doubletap', function (done) {
			var context = this;
			context.timeout(500);
			Touche.simulate.gesture(el, null, {
				MSPointer: ['Down']
			}, 'MSPointer');
			setTimeout(function() {
				Touche.simulate.gesture(el, null, {
					MSPointer: ['Up']
				}, 'MSPointer');
				setTimeout(function() {
					Touche.simulate.gesture(el, null, {
						MSPointer: ['Down']
					}, 'MSPointer');
					setTimeout(function() {
						Touche.simulate.gesture(el, null, {
							MSPointer: ['Up']
						}, 'MSPointer');
						expect(context.gestures.longtap.started).to.be(false);
						expect(context.gestures.longtap.updated).to.be(false);
						expect(context.gestures.longtap.called).to.be(false);
						expect(context.gestures.longtap.cancelled).to.be(false);
						expect(context.gestures.tap.called).to.be(false);
						expect(context.gestures.doubletap.called).to.be(true);
						done();
					}, 10);
				}, 10);
			}, 10);
		});

		afterEach(function() {
			Touche(el).off();
			expect(Touche.cache.data.length).to.be(0);
		});
		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche.utils.msPointer = origUtilsMSPointer;
			body.removeChild(el);
		});
	});
});