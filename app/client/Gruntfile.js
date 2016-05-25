module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    copy : {
      main : {
        files : [{
          expand : true,
          flatten : true,
          src : 'bower_components/bootstrap/dist/css/bootstrap.css',
          dest : 'build/css/',
          filter : 'isFile'
        },
        {
          expand : true,
          flatten : true,
          src : 'bower_components/bootstrap/dist/fonts/*',
          dest : '../static/fonts/'
        },
        {
          expand : true,
          flatten : true,
          src : 'src/img/*',
          dest : '../static/img/'
        }
        ]
      }
    },

    bower_concat: {
      options: {
        separator: ';\n'
      },

      all: {
        dest: 'build/js/_bower.js',
      }
    },

    concat: {
      options: {
        separator: ';\n'
      },

      javascript: {
        src: ['build/js/*.js', 'src/js/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      },
      css: {
        src: ['build/css/*.css', 'src/css/*.css'],
        dest: 'dist/<%= pkg.name %>.css'
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },

      dist: {
        files: {
          '../static/js/<%= pkg.name %>.min.js': ['<%= concat.javascript.dest %>']
        }
      }
    },

    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          '../static/css/<%= pkg.name %>.min.css': ['<%= concat.css.dest %>']
        }
      }
    },

    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },

    watch: {
      files: ['<%= jshint.files %>', 'src/css/*.css'],
      tasks: ['jshint', 'concat', 'uglify', 'cssmin']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['jshint']);

  grunt.registerTask('default', ['jshint', 'copy', 'bower_concat', 'concat', 'uglify', 'cssmin']);

};
