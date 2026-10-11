import React from "react";
import { createRoot } from "react-dom/client";
import { makeDefaultBoards } from "./packages/plugin-web-board-core/src/index";
import {
  accountScope,
  generationMarkerKey,
  setCanonicalCommandActivationForTests,
  setPref,
} from "./packages/plugin-web-storage/src/index";
import { BoardWorkspacesModule } from "./packages/plugin-web-board-workspaces/src/BoardWorkspacesModule";
import "./packages/plugin-web-tokens/src/tokens.css";
import "./packages/plugin-web-tokens/src/layout.css";
import "./packages/plugin-web-board-workspaces/src/styles.css";

setCanonicalCommandActivationForTests(true);
accountScope.activate(accountScope.lock("board-tasklink-native"), "generation-a");
localStorage.setItem(generationMarkerKey("board-tasklink-native"), JSON.stringify({generation:"generation-a",migrationId:"fixture",previous:null}));
const taskKey = accountScope.physicalKey("xai_task_cols");
const key = accountScope.physicalKey("xai_boards_v2");
const activeKey = accountScope.physicalKey("xai_active_board");
if (localStorage.getItem(key) === null) {
  const boards = makeDefaultBoards();
  setPref("xai_boards_v2", boards);
  setPref("xai_active_board", boards[0]!.id);
}

const nativeSet = Storage.prototype.setItem;
let denied = false;
let rejectedWrites = 0;
Storage.prototype.setItem = function (storageKey, value) {
  if (storageKey === taskKey && denied) {
    rejectedWrites += 1;
    throw new DOMException("native quota", "QuotaExceededError");
  }
  nativeSet.call(this, storageKey, value);
};

(window as typeof window & {
  verify: {
    key: string;
    taskKey: string;
    activeKey: string;
    deny: () => void;
    restore: () => void;
    rejectedWrites: () => number;
  };
}).verify = {
  key,
  taskKey,
  activeKey,
  deny() {
    denied = true;
    rejectedWrites = 0;
  },
  restore() {
    denied = false;
  },
  rejectedWrites: () => rejectedWrites,
};

createRoot(document.getElementById("app")!).render(<BoardWorkspacesModule lang="en" />);
