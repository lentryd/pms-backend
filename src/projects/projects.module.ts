import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { MembersService } from '../integrate/members/members.service';
import { StagesService } from '../integrate/stages/stages.service';
import { TasksService } from '../integrate/tasks/tasks.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, MembersService, StagesService, TasksService],
})
export class ProjectsModule {}
