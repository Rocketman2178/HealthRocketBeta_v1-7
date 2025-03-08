// Chat navigation utilities
export const getChatPath = (challengeId: string | undefined) => {
  if (!challengeId) {
    console.warn('Attempted to get chat path with undefined challenge ID');
    return '/';
  }
  return `/chat/c_${challengeId}`;
};

export const getChatId = (challengeId: string | undefined) => {
  if (!challengeId) {
    console.warn('Attempted to get chat ID with undefined challenge ID');
    return '';
  }
  return `c_${challengeId}`;
};