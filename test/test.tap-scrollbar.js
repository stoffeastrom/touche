/*global describe, Touche, expect, it, before, beforeEach, after, afterEach*/
describe('Gesture', function () {
	var body = document.body;

	describe('Trigger taps on scrollbar', function () {
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
			el.style.overflow = "scroll";
			body.appendChild(el);
		});

		beforeEach(function () {
			var context = this;
			context.started = false;
			context.called = false;
			context.cancelled = false;
			context.gesture = {
				options: {
					areaThreshold: 5,
					which: [1,2]
				},
				start: function () {
					context.started = true;
				},
				end: function () {
					context.called = true;
				}
			};
			Touche(el).tap(context.gesture);
		});

		describe( 'Mouse - tap on scrollbar', function () {
			it( 'should not be started when clicking on a vertical scrollbar', function (done) {
				Touche.simulate.gesture( el, [new Touche.Point(99,50)], null, 'mouse');
				expect( this.started ).to.be( false );
				expect( this.called ).to.be( false );
				done();
			} );

			it( 'should not be started when clicking on a horizontal scrollbar', function (done) {
				Touche.simulate.gesture( el, [new Touche.Point(50,99)], null, 'mouse');
				expect( this.started ).to.be( false );
				expect( this.called ).to.be( false );
				done();
			} );
		} );

		describe( 'Touch - tap on scrollbar', function () {
			before( function () {
				Touche.utils.touch = true;
			} );

			it( 'should not be started when tapping on a vertical scrollbar', function (done) {
				Touche.simulate.gesture( el, [new Touche.Point(99,50)], null, 'touch');
				expect( this.started ).to.be( false );
				expect( this.called ).to.be( false );
				done();
			} );

			it( 'should not be started when tapping on a vertical scrollbar with one finger and inside the target element with another', function (done) {
				Touche.simulate.gesture( el, [new Touche.Point(50,50), new Touche.Point(99,50)], null, 'touch');
				expect( this.started ).to.be( false );
				expect( this.called ).to.be( false );
				done();
			} );

			it( 'should not be started when tapping on a horizontal scrollbar', function (done) {
				Touche.simulate.gesture( el, [new Touche.Point(50,99)], null, 'touch');
				expect( this.started ).to.be( false );
				expect( this.called ).to.be( false );
				done();
			} );

			it( 'should not be started when tapping on a horizontal scrollbar with one finger and inside the target element with another', function (done) {
				Touche.simulate.gesture( el, [new Touche.Point(50,99), new Touche.Point(50,50)], null, 'touch');
				expect( this.started ).to.be( false );
				expect( this.called ).to.be( false );
				done();
			} );
		} );

		describe( 'MS pointer - tap on scrollbar', function () {
			before( function () {
				Touche.utils.msPointer = true;
			} );

			it( 'should not be started when clicking (MSPointer) on a vertical scrollbar', function (done) {
				Touche.simulate.gesture( el, [new Touche.Point(99,50)], null, 'MSPointer');
				expect( this.started ).to.be( false );
				expect( this.called ).to.be( false );
				done();
			} );

			it( 'should not be started when clicking (MSPointer) on a horizontal scrollbar', function (done) {
				Touche.simulate.gesture( el, [new Touche.Point(50,99)], null, 'MSPointer');
				expect( this.started ).to.be( false );
				expect( this.called ).to.be( false );
				done();
			} );
		} );

		afterEach(function() {
			Touche(el).off('tap');
			expect(Touche.cache.data.length).to.be(0);
		});

		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche.utils.msPointer = origUtilsMSPointer;
			body.removeChild(el);
		});
	});
});