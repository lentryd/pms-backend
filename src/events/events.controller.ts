import { Observable } from 'rxjs';
import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Sse('tasks')
  tasksEvents(): Observable<MessageEvent> {
    return this.eventsService.getTaskObservable();
  }

  @Sse('stages')
  stagesEvents() {
    return this.eventsService.getStageObservable();
  }

  @Sse('members')
  membersEvents() {
    return this.eventsService.getMemberObservable();
  }

  @Sse('projects')
  projectsEvents() {
    return this.eventsService.getProjectObservable();
  }
}
