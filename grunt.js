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
					'lib/touche.js',
					'lib/*.js'
				],
				dest: 'dist/touche.js'
			}
		},
		min: {
			dist: {
				src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
				dest: 'dist/touche.min.js'
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
				newcap: true,
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
		cp.exec('jsdoc -d docs lib/', function() {
			done();
		});
	});

	// Default task.
	grunt.registerTask('default', 'lint mocha docs concat min');
};
