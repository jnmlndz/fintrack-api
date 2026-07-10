import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail() // valida que tenga formato de email válido
  email: string;

  @IsString()
  @MinLength(8) // mínimo 8 caracteres, evita passwords ridículamente cortos
  password: string;

  @IsString()
  @MinLength(2)
  name: string;
}