import React from "react";
import {
  SessionAccount,
  SessionApiContext,
  SessionStateContext,
} from "./types";
import { useCloseAllActiveElements } from "../util";
import { useGlobalDialogsControlContext } from "@/components/dialogs/Context";
import { getInitialState, reducer } from "./reducer";
import { addSessionDebugLog } from "./logging";
import * as persisted from "@/state/persisted";
import { logEvent } from "@/lib/statsig/statsig";
export type {SessionAccount} from '@/state/session/types'

const StateContext = React.createContext<SessionStateContext>({
  accounts: [],
  currentAccount: undefined,
  hasSession: false,
});

const ApiContext = React.createContext<SessionApiContext>({
  createAccount: async () => {},
  login: async () => {},
  logoutCurrentAccount: async () => {},
  logoutEveryAccount: async () => {},
  resumeSession: async () => {},
  removeAccount: () => {},
});

export function Provider({ children }: React.PropsWithChildren<{}>) {
  const cancelPendingTask = useOneTaskAtATime();

  const [state, dispatch] = React.useReducer(reducer, null, () => {
    const initialState = getInitialState(persisted.get("session").accounts);
    addSessionDebugLog({ type: "reducer:init", state: initialState });
    return initialState;
  });

  const createAccount = React.useCallback<SessionApiContext["createAccount"]>(
    async (params) => {
      addSessionDebugLog({ type: "method:start", method: "createAccount" });
      const signal = cancelPendingTask();
      logEvent("account:create:begin", {});

      if (signal.aborted) {
        return;
      }
      //   dispatch({
      //     type: "switched-to-account",
      //     newAccount: account,
      //   });
      logEvent("account:create:success", {});
      addSessionDebugLog({
        type: "method:end",
        method: "createAccount",
        // account,
      });
    },
    [cancelPendingTask]
  );
  const login = React.useCallback<SessionApiContext["login"]>(
    async (params, logContext) => {
      addSessionDebugLog({ type: "method:start", method: "login" });
      const signal = cancelPendingTask();

      if (signal.aborted) {
        return;
      }
      const account = accountList.find(
        (acc) => acc.kitchenRole === params.identifier
      );
      dispatch({
        type: "switched-to-account",
        newAccount: account!,
      });
      logEvent("account:loggedIn", { logContext, withPassword: true });
      addSessionDebugLog({ type: "method:end", method: "login", account });
    },
    [cancelPendingTask]
  );
  const logoutEveryAccount = React.useCallback<
    SessionApiContext["logoutEveryAccount"]
  >(
    (logContext) => {
      addSessionDebugLog({ type: "method:start", method: "logout" });
      cancelPendingTask();
      dispatch({
        type: "logged-out-every-account",
      });
      logEvent("account:loggedOut", { logContext, scope: "every" });
      addSessionDebugLog({ type: "method:end", method: "logout" });
    },
    [cancelPendingTask]
  );
  React.useEffect(() => {
    if (state.needsPersist) {
      state.needsPersist = false;
      const persistedData = {
        accounts: state.accounts,
        currentAccount: state.accounts[0],
      };
      addSessionDebugLog({ type: "persisted:broadcast", data: persistedData });
      persisted.write("session", persistedData);
    }
  }, [state]);

  const stateContext = React.useMemo(
    () => ({
      accounts: state.accounts,
      currentAccount: state.accounts[0],
      hasSession: state.accounts.length > 0,
    }),
    [state]
  );
  const api = React.useMemo(
    () => ({
      createAccount,
      login,
      logoutEveryAccount,
    }),
    [createAccount, login, logoutEveryAccount]
  );
  return (
    <StateContext.Provider value={stateContext}>
      <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
    </StateContext.Provider>
  );
}
const accountList: SessionAccount[] = [
  {
    did: "1",
    kitchenRole: "waiter",
    handle: "waiter",
  },
  {
    did: "2",
    kitchenRole: "cook",
    handle: "cook",
  },
  {
    did: "3",
    kitchenRole: "admin",
    handle: "admin",
  },
  {
    did: "4",
    kitchenRole: "guest",
    handle: "guest",
  },
];

function useOneTaskAtATime() {
  const abortController = React.useRef<AbortController | null>(null);
  const cancelPendingTask = React.useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();
    return abortController.current.signal;
  }, []);
  return cancelPendingTask;
}

export function useSession() {
  return React.useContext(StateContext);
}

export function useSessionApi() {
  return React.useContext(ApiContext);
}

export function useRequireAuth() {
  const { hasSession } = useSession();
  const closeAll = useCloseAllActiveElements();
  const { signinDialogControl } = useGlobalDialogsControlContext();

  return React.useCallback(
    (fn: () => void) => {
      if (hasSession) {
        fn();
      } else {
        closeAll();
        signinDialogControl.open();
      }
    },
    [hasSession, signinDialogControl, closeAll]
  );
}
