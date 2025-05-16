import { Module } from "@nestjs/common";
import { OpenAIService } from "./openai.service";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { Message, MessageSchema } from "./message.schema";

@Module({
    imports: [
        ConfigModule,
        MongooseModule.forFeature([
            { name: Message.name, schema: MessageSchema },
        ]),
    ],
    providers: [OpenAIService],
    exports: [OpenAIService],
})
export class OpenAIModule { }
