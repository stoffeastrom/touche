/*global require, module*/
var cp = require('child_process');

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		meta: {
			version: '1.0.0',
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
			core: {
				src: [
					'<banner:meta.banner>',
					'lib/core/augment.js',
					'lib/core/touche.js',
					'lib/core/gesture-handler.js',
					'lib/core/util.js',
					'lib/core/cache.js',
					'lib/core/gesture.js',
					'lib/core/binder.js',
					'lib/core/point.js',
					'lib/core/rect.js'
				],
				dest: 'dist/touche.core.js'
			},
			all: {
				src: [
					'<config:concat.core.dest>',
					'lib/gestures/*.js'
				],
				dest: 'dist/touche.js'
			},
			light: {
				src: [
					'<config:concat.core.dest>',
					'lib/gestures/tap.js',
					'lib/gestures/doubletap.js',
					'lib/gestures/longtap.js',
					'lib/gestures/swipe.js'
				],
				dest: 'dist/touche.light.js'
			}
		},
		min: {
			core: {
				src: [
					'<banner:meta.banner>',
					'<config:concat.core.dest>'
				],
				dest: 'dist/touche.core.min.js'
			},
			all: {
				src: [
					'<banner:meta.banner>',
					'<config:concat.all.dest>'
				],
				dest: 'dist/touche.min.js'
			},
			light: {
				src: [
					'<banner:meta.banner>',
					'<config:concat.light.dest>'
				],
				dest: 'dist/touche.light.min.js'
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
