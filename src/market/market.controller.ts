import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch, Query } from '@nestjs/common';
import { MarketService } from './market.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';

@Controller('markets')
export class MarketController {
    constructor(private readonly marketService: MarketService) {}

    @UseGuards(JwtAuthGuard)
    @Get('my-markets')
        getMarketsByUser(@CurrentUser() user: any) {
            return this.marketService.findByUserId(user.sub);
        }
    @Get('categories')
        getAllCategories() {
            return this.marketService.findCategories();
        }
        
    @Get('search')
        async searchMarkets(
            @Query('lat') lat?: string,
            @Query('lng') lng?: string,
            @Query('radius') radius?: string,
            @Query('categoryId') categoryId?: string,
            @Query('startDate') startDate?: string,
            @Query('endDate') endDate?: string,
        ) {
            return await this.marketService.findFiltered({
                lat: lat ? parseFloat(lat) : undefined,
                lng: lng ? parseFloat(lng) : undefined,
                radius: radius ? parseInt(radius, 10) : 10,
                categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
                startDate,
                endDate,
            });
        }

    @Get()
        async findAll(
            @Query('regionCode') regionCode?: string,
            @Query('departmentCode') departmentCode?: string,
            @Query('cityCode') cityCode?: string,
        ) {
        // 👈 Ici on envoie bien l'objet, ce qui correspond au service modifié ci-dessus
            return this.marketService.findAll({ regionCode, departmentCode, cityCode });
        }

    @Get()
        getAllMarkets() {
            return this.marketService.findAll();
        }

    @Get(':id')
        async findOne(@Param('id') id: string) {
            return this.marketService.findOne(+id);
        }

    

    // Route sécurisée : Création d'un marché lié à l'utilisateur connecté
    @UseGuards(JwtAuthGuard) // 👈 S'assure que l'utilisateur est connecté
    @Post()
    async create(@Body() dto: CreateMarketDto, @Req() req: any) {
        // 🔍 Récupération sécurisée du userId depuis le JWT décrypté par le Guard
        // (Adapte `req.user.id` ou `req.user.sub` selon la structure de ton payload JWT)
        const userId = req.user?.sub;

        console.log('👤 [NestJS Controller] UserId extrait du token :', userId);

        return this.marketService.create(dto, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
        async update(
            @Param('id') id: string,
            @Body() dto: UpdateMarketDto, 
            @Req() req: any) {
                const userId = req.user?.sub;
                

                console.log('👤 [NestJS Controller] UserId extrait du token :', userId);

                return this.marketService.update(+id, dto, userId)
        }
}