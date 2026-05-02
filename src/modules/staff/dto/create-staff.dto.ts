import { IsString, IsEmail, MinLength, MaxLength, Matches, IsArray } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  apellido!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/, {
    message: 'La contraseña debe tener letras y números',
  })
  password!: string;

  @IsArray()
  roles!: number[];
}