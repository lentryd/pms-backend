import { Observable } from 'rxjs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, MessageEvent, Sse, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { EventsService } from './events.service';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Sse('tasks')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get SSE events for tasks',
    description:
      'This endpoint establishes a Server-Sent Events (SSE) connection to receive real-time updates for tasks.',
  })
  tasksEvents(): Observable<MessageEvent> {
    return this.eventsService.getTaskObservable();
  }

  @Sse('stages')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get SSE events for stages',
    description:
      'This endpoint establishes a Server-Sent Events (SSE) connection to receive real-time updates for stages.',
  })
  stagesEvents() {
    return this.eventsService.getStageObservable();
  }

  @Sse('projects')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get SSE events for projects',
    description:
      'This endpoint establishes a Server-Sent Events (SSE) connection to receive real-time updates for projects.',
  })
  projectsEvents() {
    return this.eventsService.getProjectObservable();
  }
}
