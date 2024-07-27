import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsService, EventType } from '../../events/events.service';
import { AddMemberDto, DelMemberDto } from './members.dto';

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  /**
   * Get all members of a project
   * @param projectId id of the project
   * @returns all members of the project
   */
  async findByProjectId(projectId: string) {
    // Find project and check if it exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        members: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Throw error if project does not exist
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Return the members of the project
    return project.members;
  }

  /**
   * Add a member to a project
   * @param data member data
   * @returns the added member
   */
  async add(data: AddMemberDto) {
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: data.projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true, name: true, email: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Add member to project
    await this.prisma.project.update({
      where: { id: data.projectId },
      data: {
        members: {
          connect: { id: data.userId },
        },
      },
    });

    // Send event and return the added member
    const member = { ...user, projectId: data.projectId };
    this.eventsService.sendEvent(EventType.MemberAdded, member);
    return member;
  }

  /**
   * Remove a member from a project
   * @param data member data
   * @returns the removed member
   */
  async del(data: DelMemberDto) {
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: data.projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true, name: true, email: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove member from project and send event
    const result = await this.prisma.project.update({
      where: { id: data.projectId },
      data: {
        members: {
          disconnect: { id: data.userId },
        },
      },
    });
    if (!result) {
      throw new BadRequestException('User is not a member of the project');
    }
    // Send event and return the added member
    const member = { ...user, projectId: data.projectId };
    this.eventsService.sendEvent(EventType.MemberRemoved, member);
    return member;
  }
}
