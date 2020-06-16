import * as mongoose from 'mongoose';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { Config } from './core/config/config.model';
import { ConfigService } from './core/config/config.service';
import { init as initExpress } from './lib/express';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	const config: Config = app.get(ConfigService).getConfig();

	// Set the mongoose debugging option based on the configuration, defaulting to false
	// logger.info(`Mongoose: Setting debug to ${mongooseDebug}`);
	mongoose.set('debug', config.mongooseLogging ?? false);
	// mongoose.set('debug', config.mongooseLogging ?? true);

	// const connectionName = app.get(TYPEGOOSE_CONNECTION_NAME);
	// const db = app.get(connectionName);

	initExpress(app.getHttpAdapter().getInstance(), config);

	app.setGlobalPrefix('api');

	// Init Swagger
	if (config.apiDocs && config.apiDocs.enabled) {
		const options = new DocumentBuilder()
			.setTitle(config.app.title)
			.setDescription(`${config.app.title} API`)
			.setVersion(config.app.version)
			.build();

		SwaggerModule.setup(config.apiDocs.path, app, SwaggerModule.createDocument(app, options));
	}

	await app.listen(config.port);
}
bootstrap();
