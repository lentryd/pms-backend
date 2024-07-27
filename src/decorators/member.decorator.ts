import { SetMetadata } from '@nestjs/common';

export const IS_OWNER_KEY = 'isOwner';
export const OnlyOwner = () => SetMetadata(IS_OWNER_KEY, true);

export const IS_MEMBER_KEY = 'isMember';
export const OnlyMember = () => SetMetadata(IS_MEMBER_KEY, true);
