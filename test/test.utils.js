/*global describe, Touche, expect, it*/
describe('Utils', function() {
	describe('#isSVG', function() {
		var isSVG = Touche.utils.isSVG,
			svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

		it('should return `true` when element is any svg element', function() {
			expect(isSVG(svgEl)).to.be(true);
		});

		it('should return `false` when not svg element', function() {
			expect(isSVG(document)).to.be(false);
		});
	});

	describe('#closest', function() {
		var closest = Touche.utils.closest,
			svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

		it('should return `null` if no match is found', function() {
			expect(closest(document, 'div')).to.be(null);
		});

		it('should return `element` found', function() {
			svg.appendChild(rect);
			expect(closest(rect, 'svg').tagName.toUpperCase()).to.be('SVG');
			expect(closest(rect, 'svg') === svg).to.be(true); //to avoid dom error
			//expect(closest(rect, 'svg')).to.be.eql(svg);
		});
	});

	describe('#transformPoint', function() {
		var transformPoint = Touche.utils.transformPoint,
			p = new Touche.Point(50,50),
			tp,
			div = document.createElement('div'),
			svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect'),
			x,
			y,
			w,
			h,
			cp,
			bbox,
			rectCP;

		it('should return same point if target is not SVG', function() {
			expect(transformPoint(document, p)).to.be.eql(p);
		});

		it('should get correct transformed point for SVG', function() {
			div.style.position = 'fixed';
			div.style.width = '200px';
			div.style.height = '200px';
			div.style.left = '200px';
			div.style.top = '200px';
			svg.setAttribute('width', '100%');
			svg.setAttribute('height', '100%');
			rect.setAttribute('x', 0);
			rect.setAttribute('y', 0);
			rect.setAttribute('width', '100%');
			rect.setAttribute('height', '100%');
			rect.setAttribute('fill-opacity', '0');

			document.body.appendChild(div);
			svg.appendChild(rect);
			div.appendChild(svg);

			x = div.offsetLeft;
			y = div.offsetTop;
			w = div.offsetWidth;
			h = div.offsetHeight;

			cp = new Touche.Point(x + (w/2), y + (h/2));
			bbox = rect.getBBox();
			rectCP = new Touche.Point(bbox.x + (bbox.width/2), bbox.y + (bbox.height/2));
			tp = transformPoint(rect, cp);
			expect(rectCP.distanceTo(tp)).to.be(0);
		});
	});

	describe('#isFunction', function() {
		var isFn = Touche.utils.isFunction;

		it('should return `true` when value is function', function(){
			expect(isFn(function(){})).to.be(true);
		});

		it('should return `false` when value is something else', function(){
			expect(isFn({})).to.be(false);
			expect(isFn([])).to.be(false);
			expect(isFn("")).to.be(false);
			expect(isFn()).to.be(false);
		});
	});

	describe('#isArray', function() {
		var isArr = Touche.utils.isArray;

		it('should return `true` when value is an array', function() {
			expect(isArr([])).to.be(true);
		});

		it('should return `false` when value is something else', function() {
			expect(isArr({})).to.be(false);
			expect(isArr(arguments)).to.be(false);
			expect(isArr(function(){})).to.be(false);
			expect(isArr("")).to.be(false);
			expect(isArr()).to.be(false);
			expect(isArr(null)).to.be(false);
			expect(isArr(window)).to.be(false);
			expect(isArr(document.createElement('i'))).to.be(false);
		});
	});

	describe('#isObject', function() {
		var isObj = Touche.utils.isObject;

		it('should return `true` when value is a plain object', function() {
			expect(isObj({})).to.be(true);
		});

		it('should return `false` when value is something else', function() {
			expect(isObj([])).to.be(false);
			expect(isObj(function(){})).to.be(false);
			expect(isObj("")).to.be(false);
			expect(isObj()).to.be(false);
			expect(isObj(null)).to.be(false);
			expect(isObj(window)).to.be(false);
			expect(isObj(document.createElement('i'))).to.be(false);
		});
	});

	describe('#extend', function() {
		var test = {
			one: true,
			two: {
				nested: [1, 2, 3]
			},
			three: function() {}
		};

		it('should be able to clone a nested object', function() {
			var target = Touche.utils.extend({}, test);
			expect(target.one).to.be(true);
			expect(Touche.utils.isObject(target.two)).to.be(true);
			expect(Touche.utils.isArray(target.two.nested)).to.be(true);
			expect(Touche.utils.isFunction(target.three)).to.be(true);
		});

		it('should never keep a reference to other objects', function() {
			var target = Touche.utils.extend({}, test);
			expect(target.one).to.be(true);
			expect(target.two).to.not.equal(test.two);
			expect(target.two.nested).to.not.equal(test.two.nested);
			expect(target.three).to.not.equal(test.three);
		});
	});

	describe("#getAngle", function() {
		var getAngle = Touche.utils.getAngle;

		it('should return correct degrees', function() {
			expect(getAngle({ x: 0, y: 0 }, { x: 0, y: 0 })).to.be(0);
			expect(getAngle({ x: 5, y: 5 }, { x: 0, y: 0 })).to.be(45);
			expect(getAngle({ x: -10, y: 5 }, { x: 10, y: 5 })).to.be(180);
			expect(getAngle({ x: 291282, y: 3912 }, { x: 9483, y: 39238499 })).to.be(270.4115148641659);
		});

		it('should always return positive values', function() {
			// todo
		});
	});

	describe("#getDeltaAngle", function() {
		var getDA = Touche.utils.getDeltaAngle;

		it('should return correct degrees', function() {
			expect(getDA({ x: 0, y: 0 }, { x: 0, y: 0 })).to.be(0);
			expect(getDA({ x: 5, y: 5 }, { x: 0, y: 0 })).to.be(-135);
			expect(getDA({ x: -10, y: 5 }, { x: 10, y: 5 })).to.be(0);
			expect(getDA({ x: 291282, y: 39120 }, { x: 948, y: 392384 })).to.be(129.415460882904);
		});
	});

	describe("#getDirection", function() {
		var getDirection = Touche.utils.getDirection;

		it('should return `invalid` when value is non-valid', function() {
			expect(getDirection(370)).to.be('invalid');
		});

		it('should be `right` between 315 and 45 degrees', function() {
			expect(getDirection(315)).to.be('right');
			expect(getDirection(0)).to.be('right');
			expect(getDirection(23.3292381292839)).to.be('right');
			expect(getDirection(44.9)).to.be('right');
		});

		it('should be `down` between 45 and 135 degrees', function() {
			expect(getDirection(45)).to.be('down');
			expect(getDirection(100)).to.be('down');
			expect(getDirection(134.9)).to.be('down');
		});

		it('should be `left` between 135 and 225 degrees', function() {
			expect(getDirection(135)).to.be('left');
			expect(getDirection(200)).to.be('left');
			expect(getDirection(224.9)).to.be('left');
		});

		it('should be `up` between 225 and 315 degrees', function() {
			expect(getDirection(240)).to.be('up');
			expect(getDirection(300)).to.be('up');
			expect(getDirection(314.9)).to.be('up');
		});
	});

	describe("#getVelocity", function() {
		var getVelocity = Touche.utils.getVelocity;

		it('should return correct velocity', function() {
			expect(
				getVelocity(new Touche.Point(0, 0), new Touche.Point(100, 0), 0, 100)
			).to.be(1);

			expect(
				getVelocity(new Touche.Point(-100, 0), new Touche.Point(100, 0), 0, 100)
			).to.be(2);

			expect(
				getVelocity(new Touche.Point(-100, 0), new Touche.Point(-100, -100), 0, 500)
			).to.be(0.2);
		});
	});
});