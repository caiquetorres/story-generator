import { Post, Body, Controller, Patch, Param, Get } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CreateProjectDto } from './dtos/create-project.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { SplitDto } from './dtos/split.dto';

import { ProjectService } from './project.service';

import { ProjectPresenter } from './project.presenter';
import { AssignImageDto } from './dtos/assing-image.dto';

@ApiTags('project')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiOperation({ summary: 'Create a new project' })
  @ApiCreatedResponse({ type: ProjectPresenter })
  @Post()
  async create(@Body() dto: CreateProjectDto): Promise<ProjectPresenter> {
    return this.projectService
      .createOne(dto.name, dto.prompt)
      .then((res) => new ProjectPresenter(res));
  }

  @ApiOperation({ summary: 'Get a project by id' })
  @ApiOkResponse({ type: ProjectPresenter })
  @Get(':projectId')
  async get(@Param('projectId') projectId: string): Promise<ProjectPresenter> {
    return this.projectService
      .getById(projectId)
      .then((res) => new ProjectPresenter(res));
  }

  @ApiOperation({ summary: 'Update a project story' })
  @ApiOkResponse({ type: ProjectPresenter })
  @Patch(':projectId')
  async update(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectPresenter> {
    return this.projectService
      .updateStory(projectId, dto.prompt)
      .then((res) => new ProjectPresenter(res));
  }

  @ApiOperation({ summary: 'Split a project into parts' })
  @ApiOkResponse({ type: ProjectPresenter })
  @Post(':projectId/parts')
  async splitIntoParts(
    @Param('projectId') projectId: string,
    @Body() dto: SplitDto,
  ): Promise<ProjectPresenter> {
    return this.projectService
      .splitIntoParts(projectId, dto.count)
      .then((res) => new ProjectPresenter(res));
  }

  @ApiOperation({ summary: 'Generate images for a project' })
  @ApiOkResponse({ type: String, isArray: true })
  @Post(':projectId/parts/:index/images')
  async generateImage(
    @Param('projectId') projectId: string,
    @Param('index') index: number,
  ): Promise<string[]> {
    return this.projectService.generateImages(projectId, index);
  }

  @ApiOperation({ summary: 'Select an image for a project' })
  @ApiOkResponse({ type: ProjectPresenter })
  @Post(':projectId/parts/:index/image')
  async selectImage(
    @Param('projectId') projectId: string,
    @Param('index') index: number,
    @Body() dto: AssignImageDto,
  ): Promise<ProjectPresenter> {
    return this.projectService
      .selectImage(projectId, index, dto.url)
      .then((res) => new ProjectPresenter(res));
  }
}
