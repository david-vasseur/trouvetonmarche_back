import { IsString, IsEmail, IsOptional, IsUrl, IsNumberString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsEmail() email?: string;

  // Profile fields
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsUrl() avatarUrl?: string;
  @IsOptional() @IsString() shopName?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUrl() logoUrl?: string;
  @IsOptional() @IsUrl() coverImageUrl?: string;
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() siret?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() instagram?: string;
  @IsOptional() @IsString() facebook?: string;
  @IsOptional() @IsString() tiktok?: string;
  @IsOptional() @IsString() youtube?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() zip?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() cityCode?: string;
  @IsOptional() @IsString() departmentCode?: string;
  @IsOptional() @IsString() regionCode?: string;
  @IsOptional() @IsNumberString() latitude?: string; // ou @IsNumber()
  @IsOptional() @IsNumberString() longitude?: string;
}