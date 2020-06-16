import { Test, TestingModule } from '@nestjs/testing';

import { EuaService } from './eua.service';

describe('EuaService', () => {
	let service: EuaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [EuaService]
		}).compile();

		service = module.get<EuaService>(EuaService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
