import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'lib/generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // 1. Instanciation de l'adaptateur avec l'URL de la base
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    // 2. Passage de l'adaptateur au constructeur parent (PrismaClient)
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}