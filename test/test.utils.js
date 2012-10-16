describe('Utils', function() {
	describe('#isFunction', function() {
		var isFn = Touche.utils.isFunction;

		it('should return true when value is function', function(){
			expect(isFn(function(){})).to.be(true);
		});

		it('should return false when value is something else', function(){
			expect(isFn({})).to.be(false);
			expect(isFn([])).to.be(false);
			expect(isFn("")).to.be(false);
			expect(isFn()).to.be(false);
		});
	});

	describe('#isArray', function() {
		var isArr = Touche.utils.isArray;
		it('should return true when value is an array', function() {
			expect(isArr([])).to.be(true);
		});
		it('should return false when value is something else', function() {
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
		it('should return true when value is a plain object', function() {
			expect(isObj({})).to.be(true);
		});

		it('should return false when value is something else', function() {
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
});