import { Test, TestingModule } from '@nestjs/testing';
import { UserAuthService } from './auth.service';

describe('AuthService', () => {
  let service: UserAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserAuthService],
    }).compile();

    service = module.get<UserAuthService>(UserAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
