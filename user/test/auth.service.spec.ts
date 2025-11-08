import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../dist/auth/dto/login.dto';
import { SignupDto } from '../src/auth/dto/signup.dto';

jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'),
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  sign: jest.fn(),
}));

const loginDto: LoginDto = {
  phone: '1234567890',
  password: 'correct',
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('supersecret'),
          },
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma.user.findFirst).toBeDefined();
  });

  describe('signup', () => {
    it('should throw if phone number already exists', async () => {
      const dto: SignupDto = { name: 'John', phone: '123', email: 'new@test.com', password: 'pass' };

      prisma.user.findFirst.mockResolvedValue({ phone: '123', email: 'test@test.com' });

      await expect(service.signup(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if email already exists', async () => {
      const dto: SignupDto = { name: 'John', phone: '999', email: 'a@b.com', password: 'pass' };

      prisma.user.findFirst.mockResolvedValue({ phone: '555', email: 'a@b.com' });

      await expect(service.signup(dto)).rejects.toThrow(BadRequestException);
    });

    it('should create a user successfully without representative', async () => {
      const dto: SignupDto = { name: 'John', phone: '123', email: 'john@test.com', password: 'pass' };

      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pass');
      prisma.user.create.mockResolvedValue({ name: 'John' });

      const result = await service.signup(dto);

      expect(result.message).toContain('Welcome John');
      expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ name: 'John', password: 'hashed-pass' }),
      }));
    });

    it('should create user with representative and increment rep score', async () => {
      const dto: SignupDto = { name: 'John', phone: '123', email: 'john@test.com', password: 'pass', representativeCode: 'rep-code' };

      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue({ id: 'rep-id' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pass');
      prisma.user.create.mockResolvedValue({ name: 'John' });
      prisma.user.update.mockResolvedValue({});

      const result = await service.signup(dto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'rep-id' },
        data: { score: { increment: 1 } },
      });
      expect(result.message).toContain('Welcome John');
    });

    it('should throw for invalid representative code', async () => {
      const dto: SignupDto = { name: 'John', phone: '123', email: 'john@test.com', password: 'pass', representativeCode: 'bad-code' };

      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.signup(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    const loginDto = { phone: '1234567890', password: 'password' };

    it('should return token if credentials are valid', async () => {
      const loginDto = { phone: '1234567890', password: 'correct' };

      prisma.user.findUnique.mockResolvedValue({ id: '1', phone: '1234567890', password: 'hashed' });

      // bcrypt returns true for password comparison
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // jwt.sign returns mocked token
      (jwt.sign as jest.Mock).mockReturnValue('mocked-token');

      const result = await service.login(loginDto);

      expect(result.access_token).toBe('mocked-token');
      expect((jwt.sign as jest.Mock)).toHaveBeenCalledWith(
        { phone: '1234567890', id: '1' },
        'supersecret',
        { expiresIn: 86400 },
      );
    });

    it('should throw if password is invalid', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', phone: '1234567890', password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('generateToken', () => {
    it('should generate JWT', async () => {
      const token = service.generateToken({ id: '1', phone: '1234567890' });
      expect(token).toBeDefined();
    });
  });

});
