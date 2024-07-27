import { IsNotEmpty, IsUUID } from 'class-validator';

export default class BaseMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  projectId: string;
}

export class AddMemberDto extends BaseMemberDto {}
export class DelMemberDto extends BaseMemberDto {}
