import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedbackDto {
	@ApiProperty({ example: 'This is a great tool! Thanks for building it.' })
	readonly body: string;

	@ApiProperty({ example: 'Bug' })
	readonly type: string;

	@ApiProperty({ example: 'http://localhost:3000/#/path/to/page' })
	readonly url: string;

	@ApiProperty({ example: 'CLASSIFICATION VALUE' })
	readonly classification: string;
}
