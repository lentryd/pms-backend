import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OmitType } from '@nestjs/mapped-types';
import { AuthGuard } from '../auth/auth.guard';

import { ProjectsService } from './projects.service';
import BaseProjectDto, {
  CreateProjectDto,
  UpdateProjectDto,
  AddMemberDto,
} from './projects.dto';

import { StagesService } from '../integrate/stages/stages.service';
import BaseStageDto, { UpdateStageDto } from '../integrate/stages/stage.dto';
class CreateStageDto extends OmitType(BaseStageDto, ['projectId']) {}

import { TasksService } from '../integrate/tasks/tasks.service';
import BaseTaskDto, { UpdateTaskDto } from '../integrate/tasks/task.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import BaseUserDto from 'src/users/users.dto';
class CreateTaskDto extends OmitType(BaseTaskDto, ['projectId']) {}

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly stagesService: StagesService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Find all projects' })
  @ApiResponse({
    status: 200,
    description: 'All projects',
    type: [BaseProjectDto],
  })
  async findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Find a project by ID' })
  @ApiResponse({
    status: 200,
    description: 'The project',
    type: BaseProjectDto,
  })
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a project' })
  @ApiResponse({
    status: 201,
    description: 'The project has been successfully created.',
    type: BaseProjectDto,
  })
  async create(@Body() data: CreateProjectDto, @Request() req) {
    return this.projectsService.create({ ...data, ownerId: req.user.id });
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully updated.',
    type: BaseProjectDto,
  })
  async update(@Param('id') id: string, @Body() data: UpdateProjectDto) {
    return this.projectsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully deleted.',
  })
  async delete(@Param('id') id: string, @Request() req) {
    return this.projectsService.delete(id, req.user.id);
  }

  @Get(':id/tasks')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Find all tasks of a project' })
  @ApiResponse({
    status: 200,
    description: 'All tasks of the project',
    type: [BaseTaskDto],
  })
  async findTasks(@Param('id') id: string) {
    return this.tasksService.findByProjectId(id);
  }

  @Post(':id/tasks')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a task for a project' })
  @ApiResponse({
    status: 201,
    description: 'The task has been successfully created.',
    type: BaseTaskDto,
  })
  async createTask(@Param('id') id: string, @Body() data: CreateTaskDto) {
    return this.tasksService.create({ ...data, projectId: id });
  }

  @Put(':id/tasks/:taskId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a task of a project' })
  @ApiResponse({
    status: 200,
    description: 'The task has been successfully updated.',
    type: BaseTaskDto,
  })
  async updateTask(
    @Param('taskId') taskId: string,
    @Body() data: UpdateTaskDto,
  ) {
    return this.tasksService.update(taskId, data);
  }

  @Delete(':id/tasks/:taskId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a task of a project' })
  @ApiResponse({
    status: 200,
    description: 'The task has been successfully deleted.',
  })
  async removeTask(@Param('taskId') taskId: string) {
    return this.tasksService.delete(taskId);
  }

  @Get(':id/stages')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Find all stages of a project' })
  @ApiResponse({
    status: 200,
    description: 'All stages of the project',
    type: [BaseStageDto],
  })
  async findStages(@Param('id') id: string) {
    return this.stagesService.findByProjectId(id);
  }

  @Post(':id/stages')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a stage for a project' })
  @ApiResponse({
    status: 201,
    description: 'The stage has been successfully created.',
    type: BaseStageDto,
  })
  async createStage(@Param('id') id: string, @Body() data: CreateStageDto) {
    return this.stagesService.create({ ...data, projectId: id });
  }

  @Put(':id/stages/:stageId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a stage of a project' })
  @ApiResponse({
    status: 200,
    description: 'The stage has been successfully updated.',
    type: BaseStageDto,
  })
  async updateStage(
    @Param('stageId') stageId: string,
    @Body() data: UpdateStageDto,
  ) {
    return this.stagesService.update(stageId, data);
  }

  @Delete(':id/stages/:stageId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a stage of a project' })
  @ApiResponse({
    status: 200,
    description: 'The stage has been successfully deleted.',
  })
  async removeStage(@Param('stageId') stageId: string) {
    return this.stagesService.delete(stageId);
  }

  @Get(':id/members')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Find all members of a project' })
  @ApiResponse({
    status: 200,
    description: 'All members of the project',
    type: [BaseUserDto],
  })
  async findMembers(@Param('id') id: string) {
    return this.projectsService.findMembers(id);
  }

  @Post(':id/members')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Add a member to a project' })
  @ApiResponse({
    status: 201,
    description: 'The member has been successfully added.',
    type: BaseUserDto,
  })
  async addMember(@Param('id') id: string, @Body() data: AddMemberDto) {
    return this.projectsService.addMember(id, data.id);
  }

  @Delete(':id/members/:memberId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Remove a member from a project' })
  @ApiResponse({
    status: 200,
    description: 'The member has been successfully removed.',
  })
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    return this.projectsService.removeMember(id, memberId);
  }
}
