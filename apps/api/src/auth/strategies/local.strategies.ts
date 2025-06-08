import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";

export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService){
        super({
            usernameField: 'email',
            passwordField: 'password'
        })
    }

    validate(email: string, password: string){
        this.authService.validateLocalUser(email, password);
    }

}