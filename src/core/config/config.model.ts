export interface Config {
	port: number;

	auth: {
		strategy: 'local' | 'proxy-pki' | string;
		sessionSecret: string;
		sessionCollection: string;
		defaultRoles: any;
	};
	mode: string;

	app: {
		title: string;
		version: string;
		url: {
			protocol: string;
			host: string;
			port: number;
		};
	};
	apiDocs: {
		enabled: boolean;
		path: string;
	};
	db: {
		admin: string | { uri: string; options: any; };
	};
	version: string;
	contactEmail: string;

	mongooseLogging: boolean;
}
