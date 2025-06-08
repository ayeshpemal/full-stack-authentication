import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocalStrategy } from './strategies/local.strategies';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PassportModule, 
    JwtModule.registerAsync(jwtConfig.asProvider()), 
    ConfigModule.forFeature(jwtConfig)
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, PrismaService, LocalStrategy],
})
export class AuthModule {}
