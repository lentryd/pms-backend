import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { StagesService } from '../integrate/stages/stages.service';
import { TasksService } from '../integrate/tasks/tasks.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, StagesService, TasksService],
})
export class ProjectsModule {}
