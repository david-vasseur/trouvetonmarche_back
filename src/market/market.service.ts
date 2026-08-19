import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adapte le chemin selon ton projet
import { Prisma } from 'lib/generated/prisma/browser';
import { Market } from 'src/types/market';
import { CreateMarketDto } from './dto/create-market.dto';
import { slugify } from 'lib/utils/string';
import { UpdateMarketDto } from './dto/update-market.dto';

const marketInclude = {
    tags: true,
    category: true,
    openingHours: true,
    promotions: true,
} as const;

type MarketWithRelations = Prisma.MarketGetPayload<{
    include: typeof marketInclude;
}>;

interface MarketFilters {
        lat?: number;
        lng?: number;
        radius?: number;
        categoryId?: number;
        date?: string;
    }

@Injectable()
export class MarketService {
  constructor(private prisma: PrismaService) {}

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance en km
    
    return distance;
}

// Petite fonction utilitaire pour convertir les degrés en radians
private toRad(value: number): number {
    return value * Math.PI / 180;
}

    private toPrismaCreateInput(dto: CreateMarketDto, userId: number): Prisma.MarketCreateInput {
    // On extrait les champs spécifiques pour éviter qu'ils se baladent en trop
    const { tags, openingHours, description, categoryId, ...marketFields } = dto;

    return {
        ...marketFields, // Contient tous les champs normaux (name, city, etc., sans categoryId)
        
        // Nettoyage description Tiptap
        description: description ? JSON.parse(JSON.stringify(description)) : undefined,

        // Dates
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        recurrenceEndAt: dto.recurrenceEndAt ? new Date(dto.recurrenceEndAt) : null,

        // 🔗 Relations obligatoires (User via le token, Category via le DTO)
        user: { connect: { id: userId } },
        category: { connect: { id: categoryId } },

        // Horaires
        openingHours: openingHours && openingHours.length > 0 ? {
        create: openingHours.map((oh) => ({
            date: new Date(`${oh.date}T00:00:00`),
            openAt: oh.openAt,
            closeAt: oh.closeAt,
        })),
        } : undefined,

        // Tags
        tags: tags && tags.length > 0 ? {
        connectOrCreate: tags.map((tagName) => {
            const slug = slugify(tagName);
            return {
            where: { slug },
            create: {
                name: tagName,
                slug: slug,
            },
            };
        }),
        } : undefined,
    };
    }

    private toPrismaUpdateInput(dto: UpdateMarketDto): Prisma.MarketUpdateInput {

        const { tags, openingHours, description, categoryId, ...marketFields } = dto;
        
        const data: Prisma.MarketUpdateInput = {
        ...marketFields,
        };

        // Gestion propre de la description (JSON Tiptap) si elle est fournie
        if (description !== undefined) {
        data.description = description ? JSON.parse(JSON.stringify(description)) : null;
        }

        // Gestion des dates si elles sont fournies
        if (dto.startAt) data.startAt = new Date(dto.startAt);
        if (dto.endAt) data.endAt = new Date(dto.endAt);
        if (dto.recurrenceEndAt !== undefined) {
        data.recurrenceEndAt = dto.recurrenceEndAt ? new Date(dto.recurrenceEndAt) : null;
        }

        // Relation Catégorie si modifiée
        if (categoryId) {
        data.category = { connect: { id: categoryId } };
        }

        // Gestion des horaires d'ouverture (souvent, la stratégie la plus simple et propre 
        // en UI est de supprimer les anciens et de recréer les nouveaux pour ce marché)
        if (openingHours !== undefined) {
        data.openingHours = {
            deleteMany: {}, // Supprime les anciens horaires
            create: openingHours.map((oh) => ({
            date: new Date(`${oh.date}T00:00:00`),
            openAt: oh.openAt,
            closeAt: oh.closeAt,
            })),
        };
        }

        // Gestion des tags si modifiés
        if (tags !== undefined) {
        data.tags = {
            set: [], // Dissocie les anciens tags
            connectOrCreate: tags.map((tagName) => {
            const slug = slugify(tagName);
            return {
                where: { slug },
                create: {
                name: tagName,
                slug: slug,
                },
            };
            }),
        };
        }

        return data;
    }

    private serializeMarket(market: MarketWithRelations): Market {
    return {
        ...market,
        
        // Champs principaux de dates
        address: market.address ?? undefined,
        zip: market.zip ?? undefined,
        startAt: market.startAt.toISOString(),
        endAt: market.endAt.toISOString(),
        recurrenceEndAt: market.recurrenceEndAt ? new Date(market.recurrenceEndAt).toISOString() : null,
        createdAt: market.createdAt.toISOString(),
        updatedAt: market.updatedAt.toISOString(),

        image: market.image ?? undefined,
        excerpt: market.excerpt ?? undefined,
        
        // Nombres
        price: market.price !== null && market.price !== undefined ? Number(market.price) : null,
        standPrice: market.standPrice !== null && market.standPrice !== undefined ? Number(market.standPrice) : null,
        
        // Tags
        tags: market.tags ? market.tags.map((tag) => tag.name) : [],

        // 👈 Sérialisation des horaires d'ouverture (Conversion Date -> string)
        openingHours: market.openingHours
        ? market.openingHours.map((oh) => ({
            ...oh,
            date: new Date(oh.date).toISOString(),
            }))
        : undefined,

        // 👈 Sérialisation des promotions si elles ont des dates
        promotions: market.promotions
        ? market.promotions.map((promo: any) => ({
            ...promo,
            startAt: promo.startAt ? new Date(promo.startAt).toISOString() : '',
            endAt: promo.endAt ? new Date(promo.endAt).toISOString() : '',
            regionCode: promo.regionCode ?? undefined,
            departmentCode: promo.departmentCode ?? undefined,
            cityCode: promo.cityCode ?? undefined,
            latitude: promo.latitude !== null && promo.latitude !== undefined ? Number(promo.latitude) : null,
            longitude: promo.longitude !== null && promo.longitude !== undefined ? Number(promo.longitude) : null,
            radiusKm: promo.radiusKm !== null && promo.radiusKm !== undefined ? Number(promo.radiusKm) : null,
            }))
        : undefined,

        category: market.category,
    } as Market;
    }

    async findAll(filters?: {
        regionCode?: string;
        departmentCode?: string;
        cityCode?: string;
    }): Promise<Market[]> {
        const where: any = {};

        if (filters?.regionCode) {
            where.regionCode = filters.regionCode;
        }
        if (filters?.departmentCode) {
            where.departmentCode = filters.departmentCode;
        }
        if (filters?.cityCode) {
            where.cityCode = filters.cityCode;
        }

        const markets = await this.prisma.market.findMany({
            where,
            include: marketInclude,
            orderBy: { startAt: 'asc' },
        });

        return markets.map((market) => this.serializeMarket(market));
    }

    async findCategories() {
        try {
            const categories = await this.prisma.marketCategory.findMany({
                orderBy: { id: 'asc' }
            });
            return categories;
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des catégories :', error);
            throw new InternalServerErrorException('Impossible de récupérer les catégories.');
        }
    }

    async findByUserId(userId: number) {
        try {
            const markets = await this.prisma.market.findMany({
                where: { userId },
                include: marketInclude,
                orderBy: { startAt: 'asc' },
            });
            return markets.map((market) => this.serializeMarket(market));
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des marchés :', error);
            throw new InternalServerErrorException('Impossible de récupérer les marchés.');
        }
    }

    async findOne(id: number) {
    const market = await this.prisma.market.findUnique({
        where: { id },
        include: {
        category: true,
        tags: true,
        openingHours: true,
        user: {
            select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            email: true,
            // N'oublie pas d'inclure le profil si tu en as besoin dans MarketOrganizer
            profile: true, 
            },
        },
        },
    });

    if (!market) {
        throw new NotFoundException(`Market with ID ${id} not found`);
    }

    return market;
    }

    async create(dto: CreateMarketDto, userId: number): Promise<{ success: boolean; data?: Market; error?: string }> {
        try {
        // 1. On parse le DTO pour obtenir l'objet compatible Prisma
        const prismaData = this.toPrismaCreateInput(dto, userId);

        // 2. On exécute la création en BDD avec l'include complet
        const market = await this.prisma.market.create({
            data: prismaData,
            include: marketInclude, // 👈 Résout l'erreur de "missing properties" dans serializeMarket
        });

        // 3. On sérialise la réponse pour le front
        return { 
            success: true, 
            data: this.serializeMarket(market) 
        };

        } catch (error) {
        console.error('❌ Erreur Prisma:', error);
        return { success: false, error: 'Erreur lors de la création du marché' };
        }
    }

    async update(id: number, dto: UpdateMarketDto, userId: number) {
        // 1. 🔒 Vérification de l'existence du marché et des droits (Sécurité propriétaire)
        const existingMarket = await this.prisma.market.findUnique({
        where: { id },
        });

        if (!existingMarket) {
        throw new NotFoundException(`Le marché avec l'ID ${id} n'existe pas.`);
        }

        // (Optionnel selon ta règle métier : vérifier si l'utilisateur est bien le propriétaire)
        if (existingMarket.userId !== userId) {
        throw new ForbiddenException("Vous n'avez pas le droit de modifier ce marché.");
        }

        // 2. 🧹 Transformation propre des données pour Prisma
        const prismaData = this.toPrismaUpdateInput(dto);

        // 3. 🚀 Exécution de la mise à jour en BDD
        return this.prisma.market.update({
        where: { id },
        data: prismaData,
        include: {
            tags: true,
            category: true,
            openingHours: true,
            promotions: true,
        },
        });
    }

   
    async findFiltered(filters: {
    lat?: number;
    lng?: number;
    radius?: number;
    categoryId?: number;
    startDate?: string;
    endDate?: string;
}): Promise<Market[]> {
    const where: Prisma.MarketWhereInput = {};

    if (filters.categoryId) {
        where.categoryId = filters.categoryId;
    }

    // Gestion de la plage de dates (Du... au...)
    if (filters.startDate || filters.endDate) {
        where.startAt = {};
        if (filters.startDate) {
            where.startAt.gte = new Date(`${filters.startDate}T00:00:00.000Z`);
        }
        if (filters.endDate) {
            where.startAt.lte = new Date(`${filters.endDate}T23:59:59.999Z`);
        }
    }

    const markets = await this.prisma.market.findMany({
        where,
        include: marketInclude,
    });

    if (filters.lat !== undefined && filters.lng !== undefined && filters.radius !== undefined) {
        return markets
            .filter(market => {
                if (market.latitude === null || market.longitude === null) return false;
                const distance = this.calculateDistance(
                    filters.lat!, 
                    filters.lng!, 
                    market.latitude, 
                    market.longitude
                );
                return distance <= filters.radius!;
            })
            .map(market => this.serializeMarket(market));
    }

    return markets.map(market => this.serializeMarket(market));
}
    
    
}