import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';

import { AuditModule } from '../audit/audit.module';

import { Feedback } from './feedback.schema';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';

@Module({
	imports: [TypegooseModule.forFeature([Feedback]), AuditModule],
	providers: [FeedbackService],
	controllers: [FeedbackController]
})
export class FeedbackModule {}
