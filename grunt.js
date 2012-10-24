/*global module:false*/
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
				run: true
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

	// Default task.
	grunt.registerTask('default', 'lint mocha concat min');
};
