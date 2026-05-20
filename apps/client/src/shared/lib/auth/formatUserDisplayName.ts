export function formatUserDisplayName(user: {
  fullName?: null | string;
  firstName?: null | string;
  lastName?: null | string;
}) {
  if (user.fullName?.trim()) {
    return user.fullName.trim();
  }

  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
}
