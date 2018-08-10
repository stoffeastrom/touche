/*global require, module*/
var cp = require('child_process');

module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-umd');
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			banner: '/*! Touché - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'* https://github.com/stoffeastrom/touche/\n' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
				'Christoffer Åström, Andrée Hansson; Licensed MIT */' + '\n'
		},
		jshint: {
			all: [
				"GruntFile.js",
				"lib/*/*.js",
				"test/*.js"
			],
			options: {
				jshintrc: ".jshintrc"
			}
		},
		mocha: {
			all: {
				src: ['test/index.html'],
				options: {
					run: true,
					ignoreLeaks: false
				}
			}
		},
		concat: {
			options: {
				banner: '<%= meta.banner %>'
			},
			core: {
				src: [
					'lib/core/augment.js',
					'lib/core/touche.js',
					'lib/core/util.js',
					'lib/core/cache.js',
					'lib/core/flow-handler.js',
					'lib/core/gesture-handler.js',
					'lib/core/super-handler.js',
					'lib/core/gesture.js',
					'lib/core/binder.js',
					'lib/core/point.js',
					'lib/core/rect.js',
					'lib/core/request-animation-frame.js'
				],
				dest: 'dist/touche.core.js'
			},
			all: {
				src: [
					'<%= concat.core.src %>',
					'lib/gestures/*.js'
				],
				dest: 'dist/touche.js'
			},
			light: {
				src: [
					'<%= concat.core.src %>',
					'lib/gestures/tap.js',
					'lib/gestures/doubletap.js',
					'lib/gestures/longtap.js',
					'lib/gestures/swipe.js'
				],
				dest: 'dist/touche.light.js'
			}
		},
		uglify: {
			options: {
				banner: '<%= meta.banner %>'
			},
			core: {
				src: [
					'<%= concat.core.dest %>'
				],
				dest: 'dist/touche.core.min.js'
			},
			all: {
				src: [
					'<%= concat.all.dest %>'
				],
				dest: 'dist/touche.min.js'
			},
			light: {
				src: [
					'<%= concat.light.dest %>'
				],
				dest: 'dist/touche.light.min.js'
			}
		},
		umd: {
			all: {
				options: {
					banner: '<%= meta.banner %>',
					src: [
						'dist/touche.js'
					],
					dest: 'dist/touche.umd.js',
					amdModuleId: 'touchejs',
					objectToExport: 'Touche',
					globalAlias: 'Touche',
				}
			}
		},
		devserver: { server: {} },
		watch: {
			files: ['<%= jshint.all %>'],
			tasks: ['jshint']
		}
	});

	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-mocha");
	grunt.loadNpmTasks("grunt-devserver");

	// Documentation generation, requires "jsdoc" to be in path
	grunt.registerTask('docs', 'Generate documentation', function () {
		var done = this.async();
		grunt.log.writeln('Generating documentation to docs/...');
		cp.exec('jsdoc -d docs -r lib/', done);
	});

	grunt.registerTask("test", ["jshint", "mocha"]);


	// Default task.
	grunt.registerTask("default", ["test", "concat", "uglify", "umd"]);
};
