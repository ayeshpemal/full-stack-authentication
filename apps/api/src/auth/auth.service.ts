import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { hash, verify } from 'argon2';
import { AuthJwtPayload } from './types/auth.jwtPayload';
import { JwtService } from '@nestjs/jwt';
import refreshConfig from './config/refresh.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
      private readonly userService: UserService, 
      private readonly jwtService: JwtService,
      @Inject(refreshConfig.KEY) 
      private refreshTokenConfig: ConfigType<typeof refreshConfig>,
    ) {}
    async registerUser(createUserDto: CreateUserDto) {
        const user = await this.userService.findByEmail(createUserDto.email);
        if (user) throw new ConflictException('User already exists with this email');
        return this.userService.create(createUserDto);
    }

    async validateLocalUser(email: string, password: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) throw new UnauthorizedException('User not found!');
        
        try {
            // Add await and use correct parameter order
            const isPasswordMatched = await verify(user.password, password);
            
            if (!isPasswordMatched)
                throw new UnauthorizedException('Invalid Credentials!');
            
            return { id: user.id, name: user.name, role: user.role };
        } catch (error) {
            throw new UnauthorizedException('Invalid Credentials!');
        }
    }

    async login(userId: number, name: string) {
        const { accessToken, refreshToken } = await this.generateTokens(userId);
        const hashedRT = await hash(refreshToken);
        await this.userService.updateHashedRefreshToken(userId, hashedRT);
        return {
          id: userId,
          name: name,
          //role,
          accessToken,
          refreshToken,
        };
      }
    
      async generateTokens(userId: number) {
        const payload: AuthJwtPayload = { sub: userId };
        const [accessToken, refreshToken] = await Promise.all([
          this.jwtService.signAsync(payload),
          this.jwtService.signAsync(payload, this.refreshTokenConfig),
        ]);
    
        return {
          accessToken,
          refreshToken,
        };
      }
    
      async validateJwtUser(userId: number) {
        const user = await this.userService.findOne(userId);
        if (!user) throw new UnauthorizedException('User not found!');
        const currentUser = { id: user.id, role: user.role };
        return currentUser;
      }
    
      async validateRefreshToken(userId: number, refreshToken: string) {
        const user = await this.userService.findOne(userId);
        if (!user) throw new UnauthorizedException('User not found!');
    
        const refreshTokenMatched = await verify(
          user.hashedRefreshToken!,
          refreshToken,
        );
    
        if (!refreshTokenMatched)
          throw new UnauthorizedException('Invalid Refresh Token!');
        const currentUser = { id: user.id };
        return currentUser;
      }
    
      async refreshToken(userId: number, name: string) {
        const { accessToken, refreshToken } = await this.generateTokens(userId);
        const hashedRT = await hash(refreshToken);
        await this.userService.updateHashedRefreshToken(userId, hashedRT);
        return {
          id: userId,
          name: name,
          accessToken,
          refreshToken,
        };
      }

      async validateGoogleUser(googleUser: CreateUserDto) {
        const user = await this.userService.findByEmail(googleUser.email);
        if (user) return user;
        return await this.userService.create(googleUser);
      }
    
      async signOut(userId: number) {
        return await this.userService.updateHashedRefreshToken(userId, null);
      }
    
}
