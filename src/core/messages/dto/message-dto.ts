import { ApiProperty } from '@nestjs/swagger';

import { MessageType } from '../message.schema';

export class MessageDto {
	@ApiProperty({ example: 'System Message' })
	readonly title: string;

	@ApiProperty({ example: 'MOTD' })
	readonly type: MessageType;

	@ApiProperty({ example: 'Example text containing user agreement.' })
	readonly body: string;
}
