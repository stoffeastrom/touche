/*global describe, Touche, expect, it, before, beforeEach, after, afterEach*/
describe( 'Scrollbar detection', function () {
	var body = document.body, el, origUtilsMSPointer, origUtilsTouch;

	describe( 'Tap on inline styled element', function () {
		// Inline styled elements does not have scrollbars
		var point = new Touche.Point( 1, 1 );

		it( 'Mouse - Tap should be started when tapping on an inline element', function ( done ) {
			triggerMouseTap( point );
			expect( this.started ).to.be( true );
			done();
		} );

		it( 'Touch - Tap should be started when tapping on an inline element', function ( done ) {
			triggerTouchTap( [point] );
			expect( this.started ).to.be( true );
			done();
		} );

		it( 'Mspointer - Tap should be started when tapping on an inline element', function ( done ) {
			triggerMSPointerTap( point );
			expect( this.started ).to.be( true );
			done();
		} );

		before( function () {
			el.innerHTML = "Test";
			el.style.position = "absolute";
			el.style.top = "0px";
			el.style.left = "0px";
		} );

		after( function () {
			el.innerHTML = "";
		} );
	} );

	describe( 'Tap on scrollbar on element with borders', function () {
		// 189 because width including borders is 100px and the element is positioned 100px to the right and the right border width is 10px
		var verticalScrollbarPoint = new Touche.Point( 189, 150 ),
			horizontalScrollbarPoint = new Touche.Point( 150, 189 );

		describe( 'Vertical scrollbar', function () {
			testTapOnScrollbar( verticalScrollbarPoint );
			testTouchTapOnScrollbar( [new Touche.Point( 150, 150 ), verticalScrollbarPoint] );
		} );

		describe( 'Horizontal scrollbar', function () {
			testTapOnScrollbar( horizontalScrollbarPoint );
			testTouchTapOnScrollbar( [new Touche.Point( 150, 150 ), horizontalScrollbarPoint] );
		} );

		before( function () {
			el.style.display = "block";
			el.style.position = "absolute";
			el.style.top = "100px";
			el.style.left = "100px";
			el.style.width = "80px";
			el.style.height = "80px";
			el.style.border = "10px solid #000";
			el.style.overflow = "scroll";
		} );
	} );

	describe( 'Tap on scrollbar on element without borders', function () {
		var verticalScrollbarPoint = new Touche.Point( 99, 50 ),
			horizontalScrollbarPoint = new Touche.Point( 50, 99 );

		describe( 'Vertical scrollbar', function () {
			testTapOnScrollbar( verticalScrollbarPoint );
			testTouchTapOnScrollbar( [verticalScrollbarPoint, new Touche.Point( 50, 50 )] );
		} );

		describe( 'Horizontal scrollbar', function () {
			testTapOnScrollbar( horizontalScrollbarPoint );
			testTouchTapOnScrollbar( [horizontalScrollbarPoint, new Touche.Point( 50, 50 )] );
		} );

		before( function () {
			el.style.display = "block";
			el.style.position = "absolute";
			el.style.top = "0px";
			el.style.left = "0px";
			el.style.width = "100px";
			el.style.height = "100px";
			el.style.border = "0";
			el.style.overflow = "scroll";
		} );
	} );

	describe( 'Tap on border on element without scrollbars', function () {
		var rightBorderPoint = new Touche.Point( 99, 50 ),
			bottomBorderPoint = new Touche.Point( 50, 99 );

		describe( 'Right border', function () {
			testTapOnBorder( rightBorderPoint );
		} );

		describe( 'Bottom border', function () {
			testTapOnBorder( bottomBorderPoint );
		} );

		before( function () {
			el.style.display = "block";
			el.style.position = "absolute";
			el.style.top = "0px";
			el.style.left = "0px";
			el.style.width = "80px";
			el.style.height = "80px";
			el.style.border = "10px solid #000";
			el.style.overflow = "hidden";
		} );
	} );

	before( function () {
		origUtilsTouch = Touche.utils.touch;
		origUtilsMSPointer = Touche.utils.msPointer;

		el = document.createElement( 'span' );
		body.appendChild( el );
	} );

	beforeEach( function () {
		var context = this;
		context.started = false;
		context.called = false;
		context.cancelled = false;
		context.gesture = {
			options: {
				areaThreshold: 5,
				which: [1, 2]
			},
			start: function () {
				context.started = true;
			},
			end: function () {
				context.called = true;
			}
		};
		Touche( el ).tap( context.gesture );
	} );

	afterEach( function () {
		Touche( el ).off( 'tap' );
		expect( Touche.cache.data.length ).to.be( 0 );
	} );

	after( function () {
		Touche.utils.touch = origUtilsTouch;
		Touche.utils.msPointer = origUtilsMSPointer;
		body.removeChild( el );
	} );

	// Help functions
	function triggerMouseTap( point ) {
		Touche.utils.touch = false;
		Touche.utils.msPointer = false;
		Touche.simulate.gesture( el, [point], null, 'mouse' );
	}

	function triggerTouchTap( points ) {
		Touche.utils.touch = true;
		Touche.utils.msPointer = false;
		Touche.simulate.gesture( el, points, null, 'touch' );
	}

	function triggerMSPointerTap( point ) {
		Touche.utils.touch = false;
		Touche.utils.msPointer = true;
		Touche.simulate.gesture( el, [point], null, 'MSPointer' );
	}

	function testTapOnScrollbar( point ) {
		it( 'Mouse - Tap should not be started when tapping on scrollbar', function () {
			triggerMouseTap( point );
			expect( this.started ).to.be( false );
		} );

		it( 'Touch - Tap should not be started when tapping on scrollbar', function () {
			triggerTouchTap( [point] );
			expect( this.started ).to.be( false );
		} );

		it( 'Mspointer - Tap should not be started when tapping on scrollbar', function () {
			triggerMSPointerTap( point );
			expect( this.started ).to.be( false );
		} );
	}

	function testTouchTapOnScrollbar( points ) {
		it( 'Touch - Tap should not be started when tapping on a scrollbar with one finger and inside the target element with another', function () {
			triggerTouchTap( points );
			expect( this.started ).to.be( false );
		} );
	}

	function testTapOnBorder( point ) {
		it( 'Mouse - Tap should be started when tapping on border', function () {
			triggerMouseTap( point );
			expect( this.started ).to.be( true );
		} );

		it( 'Touch - Tap should not be started when tapping on border', function () {
			triggerTouchTap( [point] );
			expect( this.started ).to.be( true );
		} );

		it( 'Mspointer - Tap should not be started when tapping on border', function () {
			triggerMSPointerTap( point );
			expect( this.started ).to.be( true );
		} );
	}
} );