import { Project } from './project.schema';
import { ApiProperty } from '@nestjs/swagger';

class PartPresenter {
  @ApiProperty({ example: 'Part 1' })
  title: string;

  @ApiProperty({ example: 'Description of part 1' })
  description: string;

  @ApiProperty({ example: 'https://example.com/image1.jpg' })
  image: string | null;

  constructor(title: string, description: string, image: string | null) {
    this.title = title;
    this.description = description;
    this.image = image;
  }
}

export class ProjectPresenter {
  @ApiProperty({ example: '123' })
  id: string;

  @ApiProperty({ example: 'Project 1' })
  name: string;

  @ApiProperty({ example: 'Story of project 1' })
  story: string;

  @ApiProperty({ type: [PartPresenter] })
  parts: PartPresenter[];

  constructor(project: Project) {
    this.id = project._id.toString();
    this.name = project.name;
    this.story = project.story;
    this.parts = project.parts.map(
      (part) => new PartPresenter(part.title, part.description, part.imageUrl),
    );
  }
}
