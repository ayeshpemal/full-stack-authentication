import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService){
        super({
            usernameField: 'email',
        })
    }

    async validate(email: string, password: string){
        if (password === "") throw new UnauthorizedException('Please provide a password');
        const user = await this.authService.validateLocalUser(email, password);
        if (!user) {
        throw new UnauthorizedException('Invalid credentials');
        }
        return user;
    }

}