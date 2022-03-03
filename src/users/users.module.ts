import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
// import { APP_INTERCEPTOR } from '@nestjs/core';
// import { CurrentUserInterceptor } from './interceptors/current-user-interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    // { provide: APP_INTERCEPTOR, useClass: CurrentUserInterceptor },
  ],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
