import { Body, Controller, Get, Post, Req, Request, Res, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { Response } from 'express';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  registerUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  login(@Req() req){
    return this.authService.login(req.user.id, req.user.name);
  }

  @Roles('ADMIN', 'EDITOR')
  @UseGuards(RolesGuard)
  @Get('protected')
  getAll(@Req() req) {
    return { message: 'This is a protected route', user: req.user.id}
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshTokens(@Req() req) {
    return this.authService.refreshToken(req.user.id, req.user.name);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res: Response) {
    const response = await this.authService.login(req.user.id, req.user.name);
    res.redirect(`http://localhost:3000/api/auth/google/callback?userId=${response.id}&name=${response.name}&accessToken=${response.accessToken}&refreshToken=${response.refreshToken}`);
  }

  @Post('signout')
  signout(@Req() req) {
    return this.authService.signOut(req.user.id);
  }

}
