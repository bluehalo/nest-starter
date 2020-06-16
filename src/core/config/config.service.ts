import * as path from 'path';

import * as _ from 'lodash';
import * as glob from 'glob';
import chalk from 'chalk';
import { Injectable } from '@nestjs/common';

import { Config } from './config.model';

@Injectable()
export class ConfigService {
	private readonly config: any;

	constructor() {
		this.config = this.loadConfig();
	}

	private loadConfig() {
		// Validate NODE_ENV existence
		this.validateEnvironmentVariable();

		// Get the default config
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const defaultConfig = require(path.join(process.cwd(), 'config/env/default'));

		// Get the current config
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const environmentConfig = require(path.join(process.cwd(), 'config/env/', process.env.NODE_ENV)) || {};

		// Merge config files
		const config = _.extend(defaultConfig, environmentConfig);

		// Validate Critical configuration settings
		this.validateConfiguration(config);

		// Initialize derived config values
		this.initDerivedConfig(config);

		return config;
	}

	private validateEnvironmentVariable() {
		if (null == process.env.NODE_ENV) {
			process.env.NODE_ENV = 'default';

			// Using console.log because this stuff happens before the environment is configured yet
			console.log('NODE_ENV not set, using default environment: "default" instead.');
		} else {
			console.log(`NODE_ENV is set to: "${process.env.NODE_ENV}"`);
		}

		// Try to get the environment file and see if we can load it
		const environmentFiles = glob.sync(`./config/env/${process.env.NODE_ENV}.js`);

		if (!environmentFiles.length) {
			console.log(chalk.red(`No configuration files found matching environment: "${process.env.NODE_ENV}"`));
			// Reset console color
			console.log(chalk.white(''));
		}
	}

	private validateConfiguration(config) {
		const chalkFn = (config.mode === 'development') ? chalk.green : (config.mode === 'production') ? chalk.blue : chalk.yellow;
		console.log(chalkFn(`Configuration mode set to ${config.mode}`));
	}

	private initDerivedConfig(config) {
		if (config?.app?.url?.protocol && config?.app?.url?.host) {
			config.app.serverUrlWithoutPort = `${config.app.url.protocol}://${config.app.url.host}`;

			if (config?.app?.url?.port) {
				config.app.serverUrl = `${config.app.serverUrlWithoutPort}:${config.app.url.port}`;
			} else {
				config.app.serverUrl = config.app.serverUrlWithoutPort;
			}
		}
	}

	/**
	 * Get a configuration value (either custom configuration or process environment variable)
	 * based on property path (you can use dot notation to traverse nested object, e.g. "database.host").
	 * It returns a default value if the key does not exist.
	 * @param propertyPath
	 * @param defaultValue
	 */
	get<T = any>(propertyPath: string): T | undefined;
	/**
	 * Get a configuration value (either custom configuration or process environment variable)
	 * based on property path (you can use dot notation to traverse nested object, e.g. "database.host").
	 * It returns a default value if the key does not exist.
	 * @param propertyPath
	 * @param defaultValue
	 */
	get<T = any>(propertyPath: string, defaultValue?: T): T | undefined {
		return _.get(this.config, propertyPath, defaultValue) as T;
	}

	getConfig(): Readonly<Config> {
		return this.config as Config;
	}

	getWebappConfig(): Readonly<Record<string, any>> {
		const toReturn = {};

		Object.keys(this.config.webappProperties).forEach(key => {
			const value: any = this.config.webappProperties[key];

			if (typeof value === 'string') {
				toReturn[key] = this.get(value);
			} else if (value === true) {
				toReturn[key] = this.get(key);
			}
		});

		return toReturn;
	}
}
