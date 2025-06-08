import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { verify } from 'argon2';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService) {}
    async registerUser(createUserDto: CreateUserDto) {
        const user = await this.userService.findByEmail(createUserDto.email);
        if (user) throw new ConflictException('User already exists with this email');
        return this.userService.create(createUserDto);
    }

    async validateLocalUser(email: string, password: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) throw new UnauthorizedException('User not found!');
        const isPasswordMatched = verify(user.password, password);
        if (!isPasswordMatched)
          throw new UnauthorizedException('Invalid Credentials!');
    
        return { id: user.id, name: user.name  };
    }
}
