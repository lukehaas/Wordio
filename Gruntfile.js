module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options:{},
			scripts:{
				src: ['lib/js/jquery-2.1.1.min.js','lib/js/underscore-min.js','lib/js/backbone-min.js','src/js/*.js','src/js/mixins/*.js','src/js/models/*.js','src/js/views/*.js','src/js/collections/*.js','src/js/routers/*.js'],
				dest: '_build/main.js'
			}
		},
		uglify:{
			options: {
				beautify:true
			},
			scripts: {
				src: ['_build/main.js'],
				dest: 'build/www/js/main.js'
			}
		},
		copy:{
			index:{
				src:'src/views/index.html',
				dest:'build/www/index.html'
			},
			fonts:{
				expand:true,
				cwd:'assets/font/',
				src:'**',
				dest:'build/www/font/'
			}
		},
		sass:{
			options:{
				style:'compressed'
				//style:'expanded'
			},
			dist: {
				files: {
					'build/www/css/main.css':['src/scss/main.scss'],
				}
			}
		},
		jshint:{
			options:{
				multistr:true
			},
			all: ['Gruntfile.js', 'src/js/**/*.js']
		},
		svgmin:{
			options:{},
			dist:{
				files: [{
                expand: true,
                cwd: 'assets/img',
                src: ['**/*.svg'],
                dest: 'build/www/img',
                ext: '.min.svg'
            }]
			}
		},
		watch:{
			style: {
	      		files: ['src/scss/**/*.scss'],
	      		tasks: ['style']
	      	},
	      	js: {
	      		files: ['src/js/**/*.js'],
	      		tasks: ['js']
	      	},
	      	img: {
	      		files: ['assets/img/**/*.svg'],
	      		tasks: ['svgmin']
	      	}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-svgmin');
	grunt.loadNpmTasks('grunt-contrib-watch');

  	grunt.registerTask('style', ['sass']);
  	grunt.registerTask('js', ['jshint','concat','uglify']);
  	grunt.registerTask('build', ['style','js']);

  	grunt.registerTask('default', ['copy','style','js','watch']);

};