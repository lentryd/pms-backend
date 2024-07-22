import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsService, EventType } from '../../events/events.service';
import { CreateStageDto, UpdateStageDto } from './stage.dto';

@Injectable()
export class StagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  /**
   * Find all stages
   * @returns all stages
   */
  async findAll() {
    return this.prisma.stage.findMany();
  }

  /**
   * Find a stage by id
   * @param id id of the stage
   * @returns the stage
   */
  async findOne(id: string) {
    return this.prisma.stage.findUnique({
      where: { id },
    });
  }

  /**
   * Find stages by project id
   * @param projectId id of the project
   * @returns the stages
   */
  async findByProjectId(projectId: string) {
    return this.prisma.stage.findMany({
      where: {
        projectId,
      },
    });
  }

  /**
   * Create a stage
   * @param data stage data
   * @returns the created stage
   */
  async create(data: CreateStageDto) {
    // Check if start date is before end date
    if (data.startDate >= data.endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: data.projectId },
    });
    if (!project) {
      throw new BadRequestException('Project not found');
    }

    // Create stage and send event
    const stage = await this.prisma.stage.create({ data });
    this.eventsService.sendEvent(EventType.StageCreated, stage);

    return stage;
  }

  /**
   * Update a stage
   * @param id id of the stage
   * @param data stage data
   * @returns the updated stage
   */
  async update(id: string, data: UpdateStageDto) {
    // Check if stage exists
    const stage = await this.prisma.stage.findUnique({ where: { id } });
    if (!stage) {
      throw new BadRequestException('Stage not found');
    }

    // Check if start date is before end date
    data.startDate ??= stage.startDate;
    data.endDate ??= stage.endDate;
    if (data.startDate >= data.endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Update stage and send event
    const updatedStage = await this.prisma.stage.update({
      where: { id },
      data,
    });
    this.eventsService.sendEvent(EventType.StageUpdated, updatedStage);

    return updatedStage;
  }

  /**
   * Delete a stage
   * @param id id of the stage
   * @returns the deleted stage
   */
  async delete(id: string) {
    // Check if stage exists
    const stage = await this.prisma.stage.findUnique({ where: { id } });
    if (!stage) {
      throw new BadRequestException('Stage not found');
    }

    // Find all tasks that are linked to the stage
    const deletedTasks = await this.prisma.task.findMany({
      where: { stageId: id },
    });

    await this.prisma.$transaction(async (prisma) => {
      // Delete all tasks that are linked to the stage
      await prisma.task.deleteMany({
        where: { stageId: id },
      });

      // Send events for all deleted tasks
      this.eventsService.sendEventMany(EventType.TaskDeleted, deletedTasks);
    });

    // Delete stages and send event
    await this.prisma.stage.delete({
      where: { id },
    });
    this.eventsService.sendEvent(EventType.StageDeleted, stage);

    // Return the deleted stage
    return stage;
  }
}
