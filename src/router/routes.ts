import { ROUTE_NAMES } from '../constants/routes-names';

export const routeBuilder = {
  home: (): string => '/',
  login: (): string => `/${ROUTE_NAMES.login}`,
  register: (): string => `/${ROUTE_NAMES.register}`,
  task: (id: number): string => `/${ROUTE_NAMES.task}/${id}`,
};
