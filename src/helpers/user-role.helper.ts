import { Project } from '@prisma/client';

// Define the project data with the user role
type ProjectWithMemberIds = Project & { members: { id: string }[] };
// Define the project data with the user role
type ProjectWithRole = Project & { isOwner: boolean; isMember: boolean };

/**
 * Add the user role to a project
 * @param project The project data
 * @param userId The user ID
 */
function addUserRole(
  project: ProjectWithMemberIds,
  userId: string,
): ProjectWithRole;
/**
 * Add the user role to a list of projects
 * @param projects The list of projects
 * @param userId The user ID
 */
function addUserRole(
  projects: ProjectWithMemberIds[],
  userId: string,
): ProjectWithRole[];
/**
 * Add the user role to a project or a list of projects
 * @param arg The project or list of projects
 * @param userId The user ID
 */
function addUserRole(
  arg: ProjectWithMemberIds | ProjectWithMemberIds[],
  userId: string,
) {
  const isArray = Array.isArray(arg);
  const projects = isArray
    ? (arg as ProjectWithMemberIds[])
    : [arg as ProjectWithMemberIds];

  const result = projects.map((project) => {
    // Check if the user is the owner of the project
    const isOwner = project.ownerId === userId;
    // Check if the user is a member of the project
    const isMember =
      isOwner || project.members.some((member) => member.id === userId);

    // Remove the ownerId and members from the project data
    const { ownerId, members, ...projectData } = project;

    // Return the project data with the user role
    return { ...projectData, isOwner, isMember };
  });

  return isArray ? result : result[0];
}
export { addUserRole };
