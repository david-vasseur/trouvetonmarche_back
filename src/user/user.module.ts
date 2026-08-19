import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		PrismaModule,
		JwtModule.registerAsync({
				imports: [ConfigModule],
				inject: [ConfigService],
				useFactory: async (configService: ConfigService) => ({
					secret: configService.get<string>('JWT_SECRET'),
					signOptions: { expiresIn: '1d' }, 
				}),
			}),
		],
	controllers: [UserController],
	providers: [UserService]
})
export class UserModule {}
