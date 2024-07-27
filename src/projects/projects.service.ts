import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';
import { EventsService, EventType } from 'src/events/events.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  /**
   * Find all projects
   * @returns all projects
   */
  async findAll() {
    return this.prisma.project.findMany({
      include: {
        members: { select: { id: true } },
      },
    });
  }

  /**
   * Find a project by id
   * @param id id of the project
   * @returns the project
   */
  async findOne(id: string) {
    // Find project and check if it exists
    const project = await this.prisma.project.findUnique({
      where: { id },

      include: {
        members: { select: { id: true } },
      },
    });

    // Throw error if project does not exist
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Return the project
    return project;
  }

  /**
   * Create a project
   * @param data project data
   * @returns the created project
   */
  async create(data: CreateProjectDto) {
    // Check if start date is before end date
    if (data.startDate >= data.endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Create project and send event
    const project = await this.prisma.project.create({
      data,
      include: {
        members: { select: { id: true } },
      },
    });
    this.eventsService.sendEvent(EventType.ProjectCreated, project);

    return project;
  }

  /**
   * Update a project
   * @param id id of the project
   * @param data project data
   * @returns the updated project
   */
  async update(id: string, data: UpdateProjectDto) {
    // Check if project exists
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Update project and send event
    const updatedProject = await this.prisma.project.update({
      where: { id },
      include: {
        members: { select: { id: true } },
      },
      data,
    });
    this.eventsService.sendEvent(EventType.ProjectUpdated, updatedProject);

    return updatedProject;
  }

  /**
   * Delete a project
   * @param id id of the project
   * @param userId id of the user
   * @returns the deleted project
   */
  async delete(id: string) {
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { members: { select: { id: true } } },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Delete all stages and tasks of the project
    await this.prisma.$transaction(async (prisma) => {
      // Find all tasks that are linked to the project
      const tasks = await prisma.task.findMany({
        where: { projectId: id },
      });
      // Delete all tasks
      await prisma.task.deleteMany({
        where: { projectId: id },
      });

      // Find all stages that are linked to the tasks
      const stages = await prisma.stage.findMany({
        where: { projectId: id },
      });
      // Delete all stages
      await prisma.stage.deleteMany({
        where: { projectId: id },
      });

      // Send event for all stages and tasks
      this.eventsService.sendEvent(EventType.TaskDeleted, tasks);
      this.eventsService.sendEvent(EventType.StageDeleted, stages);
    });

    // Delete project and send event
    await this.prisma.project.delete({ where: { id } });
    this.eventsService.sendEvent(EventType.ProjectDeleted, project);

    // Return the deleted project
    return project;
  }
}
