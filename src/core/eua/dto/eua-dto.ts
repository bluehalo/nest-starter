import { ApiProperty } from '@nestjs/swagger';

export class EuaDto {
	@ApiProperty({ example: 'System EUA' })
	readonly title: string;

	@ApiProperty({ example: 'Example text containing user agreement.' })
	readonly text: string;
}
