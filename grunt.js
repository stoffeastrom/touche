/*global require, module*/
var cp = require('child_process');

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		meta: {
			version: '0.1.0pre',
			banner: '/*! Touché - v<%= meta.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'* https://github.com/stoffeastrom/touche/\n' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
				'Christoffer Åström, Andrée Hansson; Licensed MIT */'
		},
		lint: {
			files: ['grunt.js', 'lib/**/*.js', 'test/*.js']
		},
		mocha: {
			all: {
				src: ['test/index.html'],
				run: true,
				ignoreLeaks: false
			}
		},
		concat: {
			dist: {
				src: [
					'<banner:meta.banner>',
					'lib/core/augment.js',
					'lib/core/binder.js',
					'lib/core/cache.js',
					'lib/core/util.js',
					'lib/core/rect.js',
					'lib/core/point.js',
					'lib/core/touche.js',
					'lib/core/gesture-handler.js',
					'lib/core/gesture.js'
				],
				dest: 'dist/touche.js'
			}
		},
		min: {
			dist: {
				src: ['<banner:meta.banner>', 'lib/gestures/*.js'],
				dest: 'dist/touche.min.js'
			},
			tap: {
				src: ['<banner:meta.banner>', 'lib/gestures/tap.js'],
				dest: 'dist/touche.tap.min.js'
			}
		},
		watch: {
			files: '<config:lint.files>',
			tasks: 'lint'
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: false,
				noarg: true,
				sub: true,
				undef: true,
				unused: true,
				boss: true,
				eqnull: true,
				browser: true
				},
			globals: {}
		},
		uglify: {}
	});

	grunt.loadNpmTasks('grunt-mocha');

	// Documentation generation, requires "jsdoc" to be in path
	grunt.registerTask('docs', 'Generate documentation', function() {
		var done = this.async();
		grunt.log.writeln('Generating documentation to docs/...');
		cp.exec('jsdoc -d docs -r lib/', done);
	});

	// Default task.
	grunt.registerTask('default', 'lint mocha docs concat min');
};
