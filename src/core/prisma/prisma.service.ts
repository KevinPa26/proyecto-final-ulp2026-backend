import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import type { ConfigType } from '@nestjs/config';
import { databaseConfig } from '../config/database.config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(databaseConfig.KEY) private dbConfig: ConfigType<typeof databaseConfig>) {
    const adapter = new PrismaMariaDb({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.name,
      connectionLimit: 5,
    });

    super({
      adapter,
      log: process.env.NODE_ENV === 'dev' ? ['query', 'error', 'warn'] : ['error']
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Prisma conectado a la base de datos');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Prisma desconectado');
  }
}