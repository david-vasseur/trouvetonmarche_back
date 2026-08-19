import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma } from "lib/generated/prisma/client";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

    async findOne(id: number) {

        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { profile: true, markets: true, promotions: true },
        });

        if (!user) throw new NotFoundException('Utilisateur introuvable');

        return user;
    }

   async updateProfile(userId: number, data: UpdateUserDto) {
    // 1. On extrait les champs qui appartiennent STRICTEMENT à la table User
    // (D'après ton schéma : email, firstName, lastName, phone, avatarUrl)
    const { 
      email, 
      firstName, 
      lastName, 
      phone, 
      avatarUrl, 
      latitude, 
      longitude, 
      ...profileFields 
    } = data;

    // 2. On nettoie les données User (on retire les `undefined`)
    const userUpdateData = Object.fromEntries(
      Object.entries({
        ...(email !== undefined && { email }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      }).filter(([_, v]) => v !== undefined)
    );

    // 3. On nettoie les données ProfessionalProfile 
    // et on convertit latitude / longitude en nombre si elles existent
    const cleanedProfileData = Object.fromEntries(
      Object.entries({
        ...profileFields,
        ...(latitude !== undefined && { 
          latitude: latitude ? parseFloat(latitude as string) : null 
        }),
        ...(longitude !== undefined && { 
          longitude: longitude ? parseFloat(longitude as string) : null 
        }),
      }).filter(([_, v]) => v !== undefined)
    );

    // 4. On construit l'objet de mise à jour pour Prisma
    const prismaUpdateData: Prisma.UserUpdateInput = {
      ...userUpdateData,
    };

    // On ajoute le bloc profile (upsert) SEULEMENT si le formulaire envoie des données de profil
    if (Object.keys(cleanedProfileData).length > 0) {
      prismaUpdateData.profile = {
        upsert: {
          create: cleanedProfileData as any,
          update: cleanedProfileData as any,
        },
      };
    }

    // 5. Exécution finale dans Prisma
    return this.prisma.user.update({
      where: { id: userId },
      data: prismaUpdateData,
      include: { 
        profile: true, // Pour renvoyer le profil à jour au BFF
      },
    });
  }
}