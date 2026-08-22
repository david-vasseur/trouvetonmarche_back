import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MarketModule } from './market/market.module';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true, // Rendre les variables accessibles partout
		}),
		PrismaModule, 
		AuthModule, MarketModule, UserModule, EmailModule
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
