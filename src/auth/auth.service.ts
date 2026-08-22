import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../../lib/generated/prisma/client'; 
import { RetrieveDto } from './dto/retrievePassword.dto';
import * as crypto from 'node:crypto';
import { EmailService } from 'src/email/email.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private emailService: EmailService
    ) {}

    async register(dto: RegisterDto) {
        // 1. Vérifier si l'utilisateur existe déjà
        const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Cet email est déjà utilisé');
        }

        // 2. Hasher le mot de passe (coût de 10)
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const role = dto.roles === 'organizer' ? UserRole.ORGANISATEUR : UserRole.EXPOSANT;

        // 3. Créer l'utilisateur en base de données
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash: hashedPassword,
                firstName: dto.firstName,
                lastName: dto.lastName,
                roles: [role]
            },
        });

        // 4. On retourne le profil sans le mot de passe
        return {
            message: 'Utilisateur créé avec succès',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            },
        };
    }

    async login(dto: LoginDto) {
        // 1. Recherche de l'utilisateur via Prisma
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Identifiants invalides');
        }

        // 2. Vérification du mot de passe (en supposant qu'il soit hashé avec bcrypt)
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        
        if (!isPasswordValid) {
            throw new UnauthorizedException('Identifiants invalides');
        }

        // 3. Génération du JWT
        const payload = { sub: user.id, email: user.email, roles: user.roles };
        const accessToken = await this.jwtService.signAsync(payload);

        // 4. On retourne le JSON brut que le Server Action Next.js interceptera
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.firstName,
                role: user.roles
            },
        };
    }

    async getProfile(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true, 
                lastName: true,
                roles: true,     
            },
        });

        if (!user) {
            throw new NotFoundException("Utilisateur introuvable.");
        }

        return user;
    }

    async retrievePassword(dto: RetrieveDto): Promise<void> {
        const { email } = dto;

        // 1. Chercher l'utilisateur par son email
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        // 🔒 ANTI-ÉNUMÉRATION : 
        // Si l'utilisateur n'existe pas, on s'arrête net et on renvoie un succès (200/204) 
        // pour ne pas fuiter l'information, mais on ne fait rien de plus.
        if (!user) {
            return; 
        }

        // 2. Générer le token brut
        const rawToken = crypto.randomBytes(32).toString('hex');

        // 3. Hasher le token pour la BDD
        const tokenHash = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

        // 4. Expiration (15 minutes)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // 5. Sauvegarder le token hashé
        await this.prisma.passwordResetToken.create({
            data: {
                tokenHash,
                userId: user.id,
                expiresAt,
            },
        });

        // 6. Construire l'URL sécurisée
        // #TODO changer l'url reelle au bon moment 
        const resetUrl = `https://ez-task.fr/login/reset-password?token=${rawToken}`;

        // 7. Envoyer via le micro-service Resend
        await this.emailService.sendResetPasswordEmail(user.email, resetUrl);
    }

    async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
        const { token, password } = dto;

        // #1 On hash le token reçu pour le comparer avec celui en bdd
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // #2 On cherche le token en base
        const resetRecord = await this.prisma.passwordResetToken.findFirst({
            where: { tokenHash: hashedToken },
        });

        // #3 Validations strictes avec des vraies exceptions (fini les return silencieux !)
        if (!resetRecord || resetRecord.used) {
            throw new BadRequestException('Le lien de réinitialisation est invalide ou a déjà été utilisé.');
        }

        if (resetRecord.expiresAt < new Date()) {
            throw new BadRequestException('Le lien de réinitialisation a expiré. Veuillez refaire une demande.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // #4 Transaction Prisma : On met à jour le mot de passe ET on invalide le token en même temps
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: resetRecord.userId },
                data: { passwordHash: hashedPassword },
            }),
            this.prisma.passwordResetToken.update({
                where: { id: resetRecord.id },
                data: { used: true }, // Empêche la réutilisation du token
            }),
        ]);

        return { message: 'Votre mot de passe a été réinitialisé avec succès.' };
    }
}