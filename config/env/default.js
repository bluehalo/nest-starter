'use strict';

const contactEmail = process.env.CONTACT_EMAIL || process.env.MAILER_ADMIN || 'noreply@asymmetrik.com';

module.exports = {
	// The port to use for the application (defaults to the environment variable if present)
	port: process.env.PORT || 3001,

	app: {
		title: 'Node REST Starter',
		name: 'Node Rest Starter',
		instanceName: 'node-rest-starter',
		url: {
			protocol: 'http',
			host: 'localhost',
			port: 3000
		},
		clientUrl: 'http://localhost/#',
		helpUrl: 'http://localhost/#/help',
		contactEmail: contactEmail
	},

	auth: {
		strategy: 'local',

		// Session Expiration controls how long sessions can live (in ms)
		sessionCookie: {
			maxAge: 24 * 60 * 60 * 1000
		},

		// Session secret is used to validate sessions
		sessionSecret: 'AJwo4MDj932jk9J5jldm34jZjnDjbnASqPksh4',

		// Session mongo collection
		sessionCollection: 'sessions'
	},

	// Swagger/OpenAPI
	apiDocs: {
		enabled: true,
		path: 'api-docs'
	},

	// MongoDB
	db: {
		admin: 'mongodb://localhost/node-rest-starter-dev'
	},

	// Webapp Properties
	webappProperties: {
		app: true,
		auth: 'auth.strategy',
		requiredRoles: 'auth.requiredRoles',

		banner: true,
		copyright: true,

		contactEmail: true,

		maxScan: true,
		maxExport: true,

		feedbackClassificationOpts: true
	}
};
