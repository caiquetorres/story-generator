import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Part, Project } from './project.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OpenAIService } from 'src/openai/openai.service';
import { MAX_PARTS } from './constants';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private readonly openaiService: OpenAIService,
  ) {}

  /**
   * Create a new project
   *
   * @param name project name
   * @param prompt story prompt
   * @returns created project
   */
  async createOne(name: string, prompt: string): Promise<Project> {
    const newPrompt = writeStoryPrompt(prompt);
    const conversationId = uuid();

    const reply = await this.openaiService.generateText(
      newPrompt,
      conversationId,
    );

    const project = await this.projectModel.create({
      _id: new Types.ObjectId(),
      name,
      story: reply,
      conversationId,
    });

    return project;
  }

  /**
   * Update a project's story
   *
   * @param id project id
   * @param prompt new story prompt
   * @returns updated project
   */
  async updateStory(id: string, prompt: string): Promise<Project> {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    const newPrompt = updateStoryPrompt(prompt);
    const reply = await this.openaiService.generateText(
      newPrompt,
      project.conversationId,
    );

    project.story = reply;
    await project.save();

    return project;
  }

  /**
   * Get a project by id
   *
   * @param id project id
   * @returns project
   */
  async getById(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    return project;
  }

  /**
   * Split a project into parts
   *
   * @param id project id
   * @param count number of parts
   * @returns updated project
   */
  async splitIntoParts(id: string, count: number): Promise<Project> {
    if (count <= 0 || count > MAX_PARTS) {
      throw new BadRequestException(
        `Invalid count, must be between 1 and ${MAX_PARTS}`,
      );
    }

    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    const prompt = splitInPartsPrompt(project.story, count);
    const reply = await this.openaiService
      .generateText(prompt) // no conversation id needed, we're not interested
      .then((res) => JSON.parse(res) as Record<string, Part>);

    const parts: Part[] = [];

    for (const part in reply) {
      parts.push({
        ...reply[part],
        imageUrl: null,
      });
    }

    project.imageCount = count;
    project.parts = parts;

    await project.save();

    return project;
  }

  /**
   * Generate images for a specific part of a project
   *
   * @param id project id
   * @param i part index
   * @returns generated image urls
   */
  async generateImages(id: string, i: number): Promise<string[]> {
    i = +i;

    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    if (!project.imageCount || !project.parts || project.parts.length === 0) {
      throw new ForbiddenException('Project was not split into parts');
    }

    if (i < 0 || i >= project.imageCount) {
      throw new NotFoundException(`Image with idx ${i} not found`);
    }

    const prompt = project.parts[i].description;
    const newPrompt = generateImagesPrompt(prompt);

    const imageUrls = await Promise.all([
      this.openaiService.generateImage(newPrompt),
      this.openaiService.generateImage(newPrompt),
      this.openaiService.generateImage(newPrompt),
    ]);

    return imageUrls;
  }

  /**
   * Select an image for a specific part of a project
   *
   * @param id project id
   * @param i part index
   * @param url image url
   * @returns updated project
   */
  async selectImage(id: string, i: number, url: string): Promise<Project> {
    i = +i;

    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    if (!project.imageCount || !project.parts || project.parts.length === 0) {
      throw new ForbiddenException('Project was not split into parts');
    }

    if (i < 0 || i >= project.imageCount) {
      throw new NotFoundException(`Image with idx ${i} not found`);
    }

    project.parts[i] = {
      ...project.parts[i],
      imageUrl: url,
    };
    await project.save();

    return project;
  }
}

function writeStoryPrompt(prompt: string): string {
  return `Given the context:
${prompt}

Write small story based on the context.`;
}

function updateStoryPrompt(prompt: string): string {
  return `Given the context:
${prompt}

Update the story using the following:`;
}

function splitInPartsPrompt(story: string, count: number): string {
  return `
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
}

function generateImagesPrompt(story: string): string {
  return `Given the context:
${story}

Generate an image in the hand drawn style.`;
}
