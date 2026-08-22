import { IsString, MinLength, Matches } from 'class-validator';
import { Match } from '../decorators/match.decorator';
export class ResetPasswordDto {

    @IsString()
    @MinLength(8, { message: 'Le mot de passe doit faire au moins 8 caractères' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Le mot de passe doit contenir au moins une lettre majuscule, une minuscule et un chiffre',
    })
    password!: string;

    @IsString()
    @Match('password', { message: 'Les mots de passe ne correspondent pas' })
    confirmPassword!: string;

    @IsString()
    token!: string

}