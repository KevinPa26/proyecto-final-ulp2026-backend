import { Module } from '@nestjs/common';
import { StaffModule } from './modules/staff/staff.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import config from './core/config';
import { validationSchema } from './core/config/validation.schema';
import { PrismaModule } from './core/prisma/prisma.module';
import { PermisosModule } from './modules/permisos/permisos.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,
      validationSchema,
      envFilePath: `.env.${process.env.NODE_ENV || 'dev'}`
    }),
    PrismaModule, StaffModule, AuthModule, PermisosModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
