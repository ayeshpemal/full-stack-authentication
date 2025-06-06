import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService) {}
    async registerUser(createUserDto: CreateUserDto) {
        const user = await this.userService.finByEmail(createUserDto.email);
        if (user) throw new ConflictException('User already exists with this email');
        return this.userService.create(createUserDto);
    }
}
