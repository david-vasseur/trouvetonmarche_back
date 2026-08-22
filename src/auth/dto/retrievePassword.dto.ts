import { IsEmail } from 'class-validator';

export class RetrieveDto {
    @IsEmail({}, { message: 'Format d\'email invalide' })
    email!: string;
}