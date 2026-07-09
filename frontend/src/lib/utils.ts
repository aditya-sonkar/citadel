/**
 * Utility functions for frontend codebase
 */
export const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};
