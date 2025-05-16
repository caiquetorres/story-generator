import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { ProjectModule } from './project/project.module';
import { MongooseConfig } from './database/config/mongoose.config';

@Module({
  imports: [
    ProjectModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({ useClass: MongooseConfig }),
  ],
})
export class AppModule {}
