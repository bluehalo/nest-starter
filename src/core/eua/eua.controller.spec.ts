import { Test, TestingModule } from '@nestjs/testing';

import { EuaController } from './eua.controller';

describe('Eua Controller', () => {
	let controller: EuaController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [EuaController]
		}).compile();

		controller = module.get<EuaController>(EuaController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
