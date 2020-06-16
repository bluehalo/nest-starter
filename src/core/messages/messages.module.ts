import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';

import { AuditModule } from '../audit/audit.module';

import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message } from './message.schema';
import { DismissedMessage } from './dismissed-message.schema';

@Module({
	imports: [TypegooseModule.forFeature([Message, DismissedMessage]), AuditModule],
	controllers: [MessagesController],
	providers: [MessagesService]
})
export class MessagesModule {}
