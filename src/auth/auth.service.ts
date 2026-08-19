import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../../lib/generated/prisma/client'; 

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
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
}