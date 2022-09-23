import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches
} from 'class-validator';

/* No se puede extender de CreateUserDto, dado que al
extender todas los atributos serian opcionales y eso
está permitido en una acción de login */
export class LoginUserDto {

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(
      /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
      message: 'The password must have a Uppercase, lowercase letter and a number'
  })
  password: string;
}