import * as compression from 'compression';
import * as helmet from 'helmet';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as methodOverride from 'method-override';
import * as cookieParser from 'cookie-parser';
import * as flash from 'connect-flash';
import * as session from 'express-session';
import * as passport from 'passport';
import * as connectMongo from 'connect-mongo';
import { Application } from 'express';

import { Config } from '../core/config/config.model';

/**
 * Initialize local variables
 */
function initLocalVariables(app, config) {
	// Setting application local variables
	app.locals.title = config.app.title;
	app.locals.description = config.app.description;
	app.locals.keywords = config.app.keywords;

	// Development
	app.locals.developmentMode = config.mode === 'development';

	// Passing the request url to environment locals
	app.use((req, res, next) => {
		res.locals.host = config.app.serverUrlWithoutPort;
		res.locals.url = config.app.clientUrl + req.originalUrl;
		next();
	});
}

/**
 * Initialize application middleware
 */
function initMiddleware(app, config) {
	// Showing stack errors
	app.set('showStackError', true);

	// Should be placed before express.static
	app.use(
		compression({
			filter: (req, res) => {
				if (req.headers['x-no-compression']) {
					// don't compress responses with this request header
					return false;
				}

				// fallback to standard filter function
				return compression.filter(req, res);
			},
			level: 6
		})
	);

	// Environment dependent middleware
	if (config.mode === 'development') {
		// Disable views cache
		app.set('view cache', false);
	} else if (config.mode === 'production') {
		app.locals.cache = 'memory';
	}

	// Optionally turn on express logging
	if (config.expressLogging) {
		app.use(morgan('dev'));
	}

	// Request body parsing middleware should be above methodOverride
	app.use(
		bodyParser.urlencoded({
			extended: true
		})
	);
	app.use(bodyParser.json());
	app.use(methodOverride());

	// Add the cookie parser and flash middleware
	app.use(cookieParser(config.auth.sessionSecret));
	app.use(flash());
}

/**
 * Configure Express session
 */
function initSession(app, config /*, db*/) {
	// Express MongoDB session storage
	const MongoStore = connectMongo(session);

	app.use(
		session({
			saveUninitialized: true,
			resave: true,
			secret: config.auth.sessionSecret,
			cookie: config.auth.sessionCookie,
			store: new MongoStore({
				url: config.db.admin,
				collection: config.auth.sessionCollection
			})
		})
	);
}

/**
 * Configure passport
 */
function initPassport(app) {
	app.use(passport.initialize());
	app.use(passport.session());

	// require('./passport').init();
}

/**
 * Configure Helmet headers configuration
 */
function initHelmetHeaders(app) {
	// Use helmet to secure Express headers
	app.use(helmet.frameguard());
	app.use(helmet.xssFilter());
	app.use(helmet.noSniff());
	app.use(helmet.ieNoOpen());
	app.disable('x-powered-by');
}

export function init(app: Application, config: Config | any /*, db*/): void {
	// Initialize local variables
	initLocalVariables(app, config);

	// Initialize Express middleware
	initMiddleware(app, config);

	// Initialize Express session
	initSession(app, config /*, db*/);

	// Initialize passport auth
	initPassport(app);

	// Initialize Helmet security headers
	initHelmetHeaders(app);
}
