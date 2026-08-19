import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOpeningHourDto {
    @IsString()
    @IsNotEmpty()
    date!: string; 

    @IsString()
    @IsNotEmpty()
    openAt!: string; 

    @IsString()
    @IsNotEmpty()
    closeAt!: string; 
}