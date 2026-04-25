export const TOTAL_TASKS = 13;

export type TaskNavigationItem = {
  id: number;
  title: string;
  description: string;
};

export const TASKS: TaskNavigationItem[] = Array.from({ length: TOTAL_TASKS }, (_, index) => {
  const id = index + 1;

  return {
    id,
    title: `Task #${id}`,
    description: `This page contains the requirements and output area for task #${id}.`,
  };
});
