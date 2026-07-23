import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK) // por default POST regresa 201, pero login debe regresar 200
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}