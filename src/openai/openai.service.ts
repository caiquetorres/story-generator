import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './message.schema';

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;

  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async splitIntoParts(story: string, count: number) {
    const prompt = `
Split the following story into ${count} parts. For each part, return a short title and a visual description suitable for image generation. Your return must be a JSON with following the format:

{
    "1": {
        "title": "Title of part 1",
        "description": "Description of part 1"
    },
    "2": {
        "title": "Title of part 2",
        "description": "Description of part 2"
    },
    ...
}

You have to finish the story in the final part.

Story:
${story}
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content!;

    const res: { title: string; description: string }[] = [];
    const json = JSON.parse(reply);

    for (const part in json) {
      res.push(json[part]);
    }

    return res;
  }

  async generateText(prompt: string, conversationId?: string): Promise<string> {
    if (!conversationId) {
      conversationId = Math.random().toString(36).substring(2, 9);
    }

    await this.messageModel.create({
      conversationId: conversationId,
      role: 'user',
      content: prompt,
    });

    const messages = await this.messageModel
      .find({
        conversationId: conversationId,
      })
      .sort({ createdAt: 1 });

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages.map((message) => ({
        role: message.role as 'user' | 'assistant',
        content: message.content,
      })),
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content!;

    await this.messageModel.create({
      conversationId: conversationId,
      role: 'assistant',
      content: reply,
    });

    return reply;
  }

  async generateImage(prompt: string): Promise<string> {
    const response = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
    });

    return response.data![0]!.url!;
  }
}
