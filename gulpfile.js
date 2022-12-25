const projectfolder = './build';
const sourcefolder = './src';


const stylePath = [
	sourcefolder + '/scss/**/_normalize.scss',
	sourcefolder + '/scss/**/_fonts.scss',
	sourcefolder + '/scss/**/main.scss',
	sourcefolder + '/scss/**/*.css',
	sourcefolder + '/scss/**/*.scss',
];

const scriptPath = [
	sourcefolder + '/js/**/jquery.js',
	sourcefolder + '/libs/**/*.js',
	sourcefolder + '/js/**/main.js',
	sourcefolder + '/js/**/*.js',
];

const fs = ('fs/promises');


const path = {
	build: {
		html: projectfolder + '/',
		css:  projectfolder + '/css/',
		js:  projectfolder + '/js/',
		img: projectfolder + '/img/',
		fonts: projectfolder + '/fonts/',
	},
	src: {
		html: [sourcefolder + '/*.html', '!' + sourcefolder + '/_*.html'],
		css: stylePath,
		js: scriptPath,
		img: sourcefolder + '/img/**/*.(jpg|JPG|png|svg|ico|webp)',
		fonts: sourcefolder + '/fonts/*.ttf',
	},
	watch: {
		html: sourcefolder + '/**/*.html',
		css: sourcefolder + '/scss/**/*.scss',
		js: sourcefolder + '/js/**/*.js',
		img: sourcefolder + '/img/**/*.(jpg|png|svg|ico|webp)',
	},
	clean: './' + projectfolder + '/',
};

import gulp from 'gulp';
	import babel from 'gulp-babel'; 
	import concat from 'gulp-concat'; 
	import autoprefixer  from 'gulp-autoprefixer'; 
	import htmlmin from 'gulp-htmlmin'; 
	import cleanCss from 'gulp-clean-css'; 
	import terser from 'gulp-terser'; 
	import {deleteSync} from 'del'; 
	import browserSync from 'browser-sync'; 
	import sourcemaps from 'gulp-sourcemaps'; 
	import dartSass from 'sass'
    import gulpSass from 'gulp-sass' 
	import image from 'gulp-image'; 
	import webp from 'gulp-webp'; 
	import webpHtmlNosvg from 'gulp-webp-html-nosvg'; 
	import rename from 'gulp-rename'; 
	import gsmq from 'gulp-group-css-media-queries'; 
	import plumber from 'gulp-plumber'; 
	import notify from 'gulp-notify'; 
	import cache from 'gulp-cache';
	import bourbon from 'bourbon'; 
	import ttf2woff from 'gulp-ttf2woff'; 
	import ttf2woff2 from 'gulp-ttf2woff2'; 
	import fonter from 'gulp-fonter'; 
	import fileinclude from 'gulp-file-include';  

	const sass = gulpSass(dartSass)


 async function html() {
	return (
		gulp.src(path.src.html)
			.pipe(fileinclude())
			.pipe(
				htmlmin({
					collapseWhitespace: true,
					removeComments: true
				})
			)
			.pipe(webpHtmlNosvg())
			.pipe(gulp.dest(path.build.html))
			.pipe(browserSync.stream()));
	
		}

 async function css() {
	return (
		gulp.src(path.src.css, { sourcemaps: true })
		.pipe(sass.sync().on('error', sass.logError))
			.pipe(concat('style.css'))
			.pipe(
				plumber({
					errorHandler: notify.onError({
						title: 'Styles',
						message: 'Error: <%= error.message %>',
					}),
				})
			)
			.pipe(
				sass({
					outputStyle: 'expanded',
				})
			)
			.pipe(gsmq())
			.pipe(
				autoprefixer({
					overrideBrowserslist: [
						'last 15 versions',
						'> 1%',
						'ie 8',
						'ie 7',
					],
					cascade: true,
				})
			)
			.pipe(gulp.dest(path.build.css))
			.pipe(sourcemaps.init())
			.pipe(
				cleanCss(
					{ level: { 1: { specialComments: 0 } } },
					(details) => {
						console.log(
							`${details.name}: ${details.stats.originalSize}`
						);
						console.log(
							`${details.name}: ${details.stats.minifiedSize}`
						);
					}
				)
			)
			.pipe(
				rename({
					extname: '.min.css',
				})
			)
			.pipe(sourcemaps.write(''))

			.pipe(gulp.dest(path.build.css))
			.pipe(browserSync.stream()));
}


async function js() {
	return (
		gulp.src(path.src.js)
			.pipe(concat('main.js'))
			.pipe(
				plumber({
					errorHandler: notify.onError({
						title: 'Styles',
						message: 'Error: <%= error.message %>',
					}),
				})
			)
			.pipe(
				babel({
					presets: ['@babel/preset-env'],
				})
			)
			.pipe(gulp.dest(path.build.js))
			.pipe(
				rename({
					extname: '.min.js',
				})
				.pipe(sourcemaps.init({loadMaps: true}))
				.pipe(terser())
				.pipe(sourcemaps.write('.'))
			)
			.pipe(gulp.dest(path.build.js))
			.pipe(browserSync.stream()));
	
}

async function images() {
	return (
		gulp.src(path.src.img)
			.pipe(
				webp({
					quality: 70,
				})
			)
			.pipe(gulp.dest(path.build.img))
			.pipe(gulp.src(path.src.img))
			.pipe(image({
						gifsicle: ['interlaced', '--true'],
						jpegrecompress: ['--progressive', '--true', '--max', 90, '--min', 80],
						pngquant: [],
						svgo: ['--plugins', 'removeViewBox', '--false'],
					}),
				)
			.pipe(gulp.dest(path.build.img))
			.pipe(browserSync.stream()));
				
}

async function fonts(params) {
	 gulp.src(path.src.fonts)
	.pipe(ttf2woff())
		.pipe(gulp.dest(path.build.fonts));
		return gulp.src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(gulp.dest(path.build.fonts));
}
		
	

	gulp.task('otf2ttf', function () {
	return gulp.src(path.src.fonts)
		.pipe(
			fonter({
				formats: ['ttf']
			})
		)
		.pipe(gulp.dest(path.build.fonts));
})




async function toClear() {
	return deleteSync(path.clean);
};




async function watchFiles() {

	browserSync.init({
		server: {
			baseDir: './' + projectfolder + '/',
		},
			tunnel: false,
		default: 3000
		});

		
		gulp.watch([path.watch.html], html);
		gulp.watch([path.watch.css], css);
		gulp.watch([path.watch.js], js);
		gulp.watch([path.watch.img], images);
	gulp.watch([path.watch.html]).on("change", browserSync.reload);
	gulp.watch([path.watch.css]).on("change", browserSync.reload);
	

	}

	gulp.task("watch", watchFiles);
gulp.task("build", gulp.series(toClear, gulp.parallel(js, css, html, images, fonts)));
gulp.task("default", gulp.series("build", "watch"));

export {fonts};
export {images};
export {js};
export {css};
export {html};
export {watchFiles};