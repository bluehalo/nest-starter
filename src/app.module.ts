import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';

import { CoreModule } from './core/core.module';
import { SiteModule } from './site/site.module';
import { ConfigModule } from './core/config/config.module';
import { ConfigService } from './core/config/config.service';

@Module({
	imports: [
		TypegooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => {
				const dbConfig = configService.getConfig().db.admin as any;

				return Object.assign(
					{
						uri: dbConfig.uri ?? dbConfig,
						useNewUrlParser: true,
						useUnifiedTopology: true,
						useFindAndModify: false,
						useCreateIndex: true
					},
					dbConfig.options
				);
			},
			inject: [ConfigService]
		}),
		CoreModule,
		SiteModule
	]
})
export class AppModule {}
