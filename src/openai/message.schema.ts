import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class Message {
    _id: Types.ObjectId;

    @Prop({ required: true })
    conversationId: string;

    @Prop({ required: true })
    role: string;

    @Prop({ required: true })
    content: string;

    @Prop({ default: Date.now })
    createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
