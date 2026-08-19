import { IsEmail, IsString, MinLength, Matches, IsIn } from 'class-validator';
import { Match } from '../decorators/match.decorator'; 
export class RegisterDto {
    @IsEmail({}, { message: 'Format d\'email invalide' })
    email!: string;

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
    @MinLength(2, { message: 'Le prénom doit faire au moins 2 caractères' })
    firstName!: string;

    @IsString()
    @MinLength(2, { message: 'Le nom doit faire au moins 2 caractères' })
    lastName!: string;

    @IsIn(['exhibitor', 'organizer'], { message: 'Veuillez choisir un type valide.' })
    roles!: 'exhibitor' | 'organizer';
}