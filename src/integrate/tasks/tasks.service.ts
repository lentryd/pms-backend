import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './task.dto';
import { EventsService, EventType } from 'src/events/events.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  /**
   * Find all tasks
   * @returns all tasks
   */
  async findAll() {
    return this.prisma.task.findMany();
  }

  /**
   * Find a task by id
   * @param id id of the task
   * @returns a task
   */
  async findOne(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
    });
  }

  /**
   * Find tasks by stage id
   * @param stageId id of the stage
   * @returns the tasks
   */
  async findByStageId(stageId: string) {
    return this.prisma.task.findMany({
      where: { stageId },
    });
  }

  /**
   * Find tasks by project id
   * @param projectId id of the project
   * @returns the tasks
   */
  async findByProjectId(projectId: string) {
    return this.prisma.task.findMany({
      where: { projectId },
    });
  }

  /**
   * Create a task
   * @param data task data
   * @returns the created task
   */
  async create(data: CreateTaskDto) {
    // Check if start date is before end date
    if (data.startDate >= data.endDate) {
      throw new BadRequestException('End date must be after start date');
    }
    // Check if stage exists
    const stage = await this.prisma.stage.findUnique({
      where: { id: data.stageId },
    });
    if (!stage) {
      throw new BadRequestException('Stage not found');
    }
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: data.projectId },
    });
    if (!project) {
      throw new BadRequestException('Project not found');
    }

    // Check if task index is valid
    const taskIndex = await this.prisma.task.count({
      where: { stageId: data.stageId },
    });
    if (data.indexAtStage > taskIndex + 1) {
      throw new BadRequestException('Invalid task index at stage');
    }
    // Update task indexes
    await this.prisma.task.updateMany({
      where: {
        stageId: data.stageId,
        indexAtStage: { gte: data.indexAtStage },
      },
      data: { indexAtStage: { increment: 1 } },
    });
    const updatedTasks = await this.prisma.task.findMany({
      where: {
        stageId: data.stageId,
        indexAtStage: { gte: data.indexAtStage },
      },
    });
    this.eventsService.sendEventMany(EventType.TaskUpdated, updatedTasks);

    // Create task and send event
    const task = await this.prisma.task.create({ data });
    this.eventsService.sendEvent(EventType.TaskCreated, task);

    return task;
  }

  /**
   * Update a task
   * @param id id of the task
   * @param data task data
   * @returns the updated task
   */
  async update(id: string, data: UpdateTaskDto) {
    // Check if task exists
    const task = await this.findOne(id);
    if (!task) {
      throw new BadRequestException('Task not found');
    }

    // Check if start date is before end date
    data.startDate ??= task.startDate;
    data.endDate ??= task.endDate;
    if (data.startDate >= data.endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check if stage exists
    if (data.stageId) {
      const stage = await this.prisma.stage.findUnique({
        where: { id: data.stageId },
      });
      if (!stage) {
        throw new BadRequestException('Stage not found');
      }
    }

    // Update task indexes if stage or index changes
    if (data.stageId || data.indexAtStage) {
      const oldStageId = task.stageId;
      const oldIndexAtStage = task.indexAtStage;
      const newStageId = data.stageId ?? oldStageId;
      const newIndexAtStage = data.indexAtStage ?? oldIndexAtStage;

      // Check if task index is valid
      const taskIndex = await this.prisma.task.count({
        where: { stageId: newStageId },
      });
      if (newIndexAtStage > taskIndex + 1) {
        throw new BadRequestException('Invalid task index at stage');
      }

      if (oldStageId !== newStageId) {
        // If task is moved to a different stage
        // Decrement indices of tasks in old stage
        await this.prisma.task.updateMany({
          where: {
            stageId: oldStageId,
            indexAtStage: { gt: oldIndexAtStage },
          },
          data: { indexAtStage: { decrement: 1 } },
        });

        // Increment indices of tasks in new stage
        await this.prisma.task.updateMany({
          where: {
            stageId: newStageId,
            indexAtStage: { gte: newIndexAtStage },
          },
          data: { indexAtStage: { increment: 1 } },
        });
      } else {
        // If task is moved within the same stage
        if (newIndexAtStage < oldIndexAtStage) {
          // Increment indices of tasks between newIndexAtStage and oldIndexAtStage
          await this.prisma.task.updateMany({
            where: {
              stageId: oldStageId,
              indexAtStage: {
                gte: newIndexAtStage,
                lt: oldIndexAtStage,
              },
            },
            data: { indexAtStage: { increment: 1 } },
          });
        } else if (newIndexAtStage > oldIndexAtStage) {
          // Decrement indices of tasks between oldIndexAtStage and newIndexAtStage
          await this.prisma.task.updateMany({
            where: {
              stageId: oldStageId,
              indexAtStage: {
                gt: oldIndexAtStage,
                lte: newIndexAtStage,
              },
            },
            data: { indexAtStage: { decrement: 1 } },
          });
        }
      }
    }

    // Update task and send event
    const updatedTask = await this.prisma.task.update({ where: { id }, data });

    if (task.stageId === updatedTask.stageId) {
      this.eventsService.sendEvent(EventType.TaskUpdated, updatedTask);
    } else {
      // Update tasks and send events
      await this.prisma.task
        .findMany({
          where: {
            OR: [{ stageId: task.stageId }, { stageId: updatedTask.stageId }],
          },
        })
        .then((tasks) =>
          this.eventsService.sendEventMany(EventType.TaskUpdated, tasks),
        );
    }

    return updatedTask;
  }

  /**
   * Delete a task
   * @param id id of the task
   * @returns the deleted task
   */
  async delete(id: string) {
    // Check if task exists
    const task = await this.findOne(id);
    if (!task) {
      throw new BadRequestException('Task not found');
    }

    // Delete task and send event
    await this.prisma.task.delete({ where: { id } });
    this.eventsService.sendEvent(EventType.TaskDeleted, task);

    // Update task indexes
    await this.prisma.task.updateMany({
      where: {
        stageId: task.stageId,
        indexAtStage: { gt: task.indexAtStage },
      },
      data: { indexAtStage: { decrement: 1 } },
    });

    // Update tasks and send events
    const updatedTasks = await this.prisma.task.findMany({
      where: { stageId: task.stageId },
    });
    this.eventsService.sendEventMany(EventType.TaskUpdated, updatedTasks);

    // Return the deleted task
    return task;
  }
}
