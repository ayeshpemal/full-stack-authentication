import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { verify } from 'argon2';
import { use } from 'passport';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService) {}
    async registerUser(createUserDto: CreateUserDto) {
        const user = await this.userService.finByEmail(createUserDto.email);
        if (user) throw new ConflictException('User already exists with this email');
        return this.userService.create(createUserDto);
    }

    async validateLocalUser(email: string, password: string) {
        const user = await this.userService.finByEmail(email);
        if (!user) throw new UnauthorizedException("User not found");
        const isPasswordMathced = verify(user.password, password);
        if (!isPasswordMathced) throw new UnauthorizedException("Invalid credentials");
        return {id:user.id, name:user.name};
    }
}
