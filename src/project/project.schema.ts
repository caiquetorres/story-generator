import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CatDocument = HydratedDocument<Project>;

type Url = string;

export type Part = {
  title: string;
  description: string;
  imageUrl: Url | null;
};

@Schema()
export class Project {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  conversationId: string;

  @Prop({ required: true })
  story: string;

  @Prop()
  imageCount: number;

  @Prop()
  parts: Part[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
