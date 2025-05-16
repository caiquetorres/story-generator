import { Module } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { ProjectController } from "./project.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Project, ProjectSchema } from "./project.schema";
import { OpenAIModule } from "src/openai/openai.module";

@Module({
    imports: [
        OpenAIModule,
        MongooseModule.forFeature([{
            name: Project.name,
            schema: ProjectSchema
        }]),
    ],
    controllers: [ProjectController],
    providers: [ProjectService],
})
export class ProjectModule { }
