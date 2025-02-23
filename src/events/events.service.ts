import { Injectable, MessageEvent } from '@nestjs/common';
import { Subject } from 'rxjs';

export enum EventType {
  TaskCreated = 'task.created',
  TaskUpdated = 'task.updated',
  TaskDeleted = 'task.deleted',
  StageCreated = 'stage.created',
  StageUpdated = 'stage.updated',
  StageDeleted = 'stage.deleted',
  MemberAdded = 'member.added',
  MemberRemoved = 'member.removed',
  ProjectCreated = 'project.created',
  ProjectUpdated = 'project.updated',
  ProjectDeleted = 'project.deleted',
}

@Injectable()
export class EventsService {
  private tasksMessageEvent = new Subject<MessageEvent>();
  private stagesMessageEvent = new Subject<MessageEvent>();
  private membersMessageEvent = new Subject<MessageEvent>();
  private projectsMessageEvent = new Subject<MessageEvent>();

  sendEvent(event: EventType, data: any | any[]) {
    if (event.startsWith('task')) {
      this.tasksMessageEvent.next({ data: { event, data } });
    } else if (event.startsWith('stage')) {
      this.stagesMessageEvent.next({ data: { event, data } });
    } else if (event.startsWith('member')) {
      this.membersMessageEvent.next({ data: { event, data } });
    } else if (event.startsWith('project')) {
      this.projectsMessageEvent.next({ data: { event, data } });
    }
  }

  getTaskObservable() {
    return this.tasksMessageEvent.asObservable();
  }

  getStageObservable() {
    return this.stagesMessageEvent.asObservable();
  }

  getMemberObservable() {
    return this.membersMessageEvent.asObservable();
  }

  getProjectObservable() {
    return this.projectsMessageEvent.asObservable();
  }
}
