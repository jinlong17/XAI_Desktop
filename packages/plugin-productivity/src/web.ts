import type { WebModuleRouteRegistration } from "@repo/core/types";
import { TodoWebModuleRoute } from "./web/TodoWebModuleRoute";

export const todoWebModuleRegistration: WebModuleRouteRegistration = {
  moduleId: "todos",
  label: "Todos",
  defaultChildPath: "smart:inbox",
  children: [
    {
      path: "",
      render: TodoWebModuleRoute,
    },
    {
      path: ":listId",
      render: TodoWebModuleRoute,
    },
    {
      path: ":listId/:todoId",
      render: TodoWebModuleRoute,
    },
  ],
};

