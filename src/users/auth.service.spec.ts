import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth serice', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('test@test.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  // it('throws an error if user signs up with email that is in use', async () => {
  //   fakeUsersService.find = () =>
  //     Promise.resolve([{ id: 1, email: 'a', password: '1' } as User]);
  //   await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
  //     'Email in use.',
  //   );
  // });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('test@test.com', 'mypassword');

    await expect(service.signup('test@test.com', 'asdf')).rejects.toThrowError(
      BadRequestException,
    );
  });

  it('throws if signin is called with and unused email', async () => {
    await expect(
      service.signin('asdfasdf@asdf.com', 'asdfsadf'),
    ).rejects.toThrowError(NotFoundException);
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('asdf@lslk.com', 'test1234');

    await expect(
      service.signin('asdf@lslk.com', 'password'),
    ).rejects.toThrowError(BadRequestException);
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('asdf@asdf.com', 'mypassword');

    const user = await service.signin('asdf@asdf.com', 'mypassword');
    expect(user).toBeDefined();
  });
});
