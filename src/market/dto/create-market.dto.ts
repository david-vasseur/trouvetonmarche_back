import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsDateString, 
  IsEnum, 
  IsBoolean, 
  IsArray, 
  IsUrl, 
  IsInt, 
  ValidateNested
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { 
  Recurrence, 
  MarketType, 
  ElectricityOption, 
  BarnumRequirement, 
  ParkingAvailability 
} from '../../../lib/generated/prisma/enums'; 
import { CreateOpeningHourDto } from './create-opening-hour.dto';
import { MarketTagDto } from './create-tag.dto';

export class CreateMarketDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  // Adresse
  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  zip?: string;

  // Localisation administrative
  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  cityCode!: string;

  @IsString()
  @IsNotEmpty()
  department!: string;

  @IsString()
  @IsNotEmpty()
  departmentCode!: string;

  @IsString()
  @IsNotEmpty()
  region!: string;

  @IsString()
  @IsNotEmpty()
  regionCode!: string;

  // Géolocalisation
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  // Événement
  @IsDateString()
  @IsNotEmpty()
  startAt!: string;

  @IsDateString()
  @IsNotEmpty()
  endAt!: string;

  @IsEnum(Recurrence)
  @IsOptional()
  recurrence?: Recurrence;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  recurrenceEndAt?: string;

  // Informations
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  history?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  visitors?: number;

  // Type de marché
  @IsEnum(MarketType)
  @IsOptional()
  marketType?: MarketType;

  // Tarifs
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  standPrice?: number;

  // Contenu
  @IsString()
  @IsNotEmpty()
  excerpt!: string;

  // Le champ JSON Tiptap (reçoit un objet ou un tableau JSON brut)
  @IsNotEmpty()
  description: any;

    @IsUrl()
    @IsOptional()
    @Transform(({ value }) => (value === '' ? undefined : value))
    externalUrl?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  exhibitors?: number;

  @IsBoolean()
  @IsOptional()
  registrationsOpen?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  standSizes?: string[];

  @IsEnum(ElectricityOption)
  @IsOptional()
  electricity?: ElectricityOption;

  @IsEnum(BarnumRequirement)
  @IsOptional()
  barnum?: BarnumRequirement;

  @IsEnum(ParkingAvailability)
  @IsOptional()
  parkingAvailability?: ParkingAvailability;

  @IsBoolean()
  @IsOptional()
  parkingFree?: boolean;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  image?: string;

  // Relations (IDs obligatoires ou optionnels selon ta logique)
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  categoryId!: number;

  // Optionnel si tu gères l'association des tags par leurs IDs (ex: [1, 2, 5])
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @Type(() => Number)
  tagIds?: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOpeningHourDto)
  @IsOptional()
  openingHours?: CreateOpeningHourDto[];

  // 🏷️ Tags (Objets structurés : name, slug, etc.)
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}