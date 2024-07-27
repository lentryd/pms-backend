// Libraries
import { OmitType } from '@nestjs/mapped-types';
import { UseGuards, Controller } from '@nestjs/common';
import { Get, Put, Post, Delete, Body, Param } from '@nestjs/common';
// Guards
import { MemberGuard } from '../guards/member.guard';
// Decorators
import { CurrentUser } from '../decorators/current-user.decorator';
import { OnlyOwner, OnlyMember } from '../decorators/member.decorator';
// Services
import { TasksService } from '../integrate/tasks/tasks.service';
import { StagesService } from '../integrate/stages/stages.service';
import { MembersService } from '../integrate/members/members.service';
import { ProjectsService } from './projects.service';
// DTOs
import BaseMemberDto from '../integrate/members/members.dto';
import BaseTaskDto, { UpdateTaskDto } from '../integrate/tasks/task.dto';
import BaseStageDto, { UpdateStageDto } from '../integrate/stages/stage.dto';
import BaseProjectDto, { UpdateProjectDto } from './projects.dto';
// Helper functions
import { addUserRole } from '../helpers/user-role.helper';

// DTOs for creating tasks, stages and projects
class AddMemberDto extends OmitType(BaseMemberDto, ['projectId']) {}
class CreateTaskDto extends OmitType(BaseTaskDto, ['projectId']) {}
class CreateStageDto extends OmitType(BaseStageDto, ['projectId']) {}
class CreateProjectDto extends OmitType(BaseProjectDto, ['ownerId']) {}

@UseGuards(MemberGuard)
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly stagesService: StagesService,
    private readonly membersService: MembersService,
    private readonly projectsService: ProjectsService,
  ) {}

  // Endpoints to find all projects or a single project by ID

  @Get()
  async findAll(@CurrentUser() userId: string) {
    // Find all projects
    const projects = await this.projectsService.findAll();

    return addUserRole(projects, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() userId: string) {
    // Find the project by ID
    const project = await this.projectsService.findOne(id);

    return addUserRole(project, userId);
  }

  // Endpoints to create, update, and delete a project

  @Post()
  async create(@Body() data: CreateProjectDto, @CurrentUser() userId: string) {
    // Create the project
    const project = await this.projectsService.create({
      ...data,
      ownerId: userId,
    });

    return addUserRole(project, userId);
  }

  @Put(':id')
  @OnlyOwner()
  async update(
    @Param('id') id: string,
    @Body() data: UpdateProjectDto,
    @CurrentUser() userId: string,
  ) {
    // Update the project
    const project = await this.projectsService.update(id, data);

    return addUserRole(project, userId);
  }

  @Delete(':id')
  @OnlyOwner()
  async delete(@Param('id') id: string, @CurrentUser() userId: string) {
    // Delete the project
    const project = await this.projectsService.delete(id);

    return addUserRole(project, userId);
  }

  // Endpoints to find, create, update, and delete tasks

  @Get(':id/tasks')
  async findTasks(@Param('id') id: string) {
    return this.tasksService.findByProjectId(id);
  }

  @Post(':id/tasks')
  @OnlyMember()
  async createTask(@Param('id') id: string, @Body() data: CreateTaskDto) {
    return this.tasksService.create({ ...data, projectId: id });
  }

  @Put(':id/tasks/:taskId')
  @OnlyMember()
  async updateTask(
    @Param('taskId') taskId: string,
    @Body() data: UpdateTaskDto,
  ) {
    return this.tasksService.update(taskId, data);
  }

  @Delete(':id/tasks/:taskId')
  @OnlyMember()
  async removeTask(@Param('taskId') taskId: string) {
    return this.tasksService.delete(taskId);
  }

  // Endpoints to find, create, update, and delete stages

  @Get(':id/stages')
  async findStages(@Param('id') id: string) {
    return this.stagesService.findByProjectId(id);
  }

  @Post(':id/stages')
  @OnlyMember()
  async createStage(@Param('id') id: string, @Body() data: CreateStageDto) {
    return this.stagesService.create({ ...data, projectId: id });
  }

  @Put(':id/stages/:stageId')
  @OnlyMember()
  async updateStage(
    @Param('stageId') stageId: string,
    @Body() data: UpdateStageDto,
  ) {
    return this.stagesService.update(stageId, data);
  }

  @Delete(':id/stages/:stageId')
  @OnlyMember()
  async removeStage(@Param('stageId') stageId: string) {
    return this.stagesService.delete(stageId);
  }

  // Endpoints to find, add, and remove members from a project

  @Get(':id/members')
  async findMembers(@Param('id') id: string) {
    // Find all members of the project
    const members = await this.membersService.findByProjectId(id);

    // Add the project ID to each member
    return members.map((member) => ({ ...member, projectId: id }));
  }

  @Post(':id/members')
  @OnlyOwner()
  async addMember(@Param('id') id: string, @Body() data: AddMemberDto) {
    // Add the member to the project
    return this.membersService.add({ ...data, projectId: id });
  }

  @Delete(':id/members/:memberId')
  @OnlyOwner()
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') userId: string,
  ) {
    // Remove the member from the project
    return this.membersService.del({ projectId: id, userId });
  }
}
