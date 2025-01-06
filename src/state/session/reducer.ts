import { wrapSessionReducerForLogging } from "./logging";
import { SessionAccount } from "./types";

export type State = {
  readonly accounts: SessionAccount[];
  needsPersist: boolean; // Mutated in an effect.
};

export type Action =
  | {
      type: "switched-to-account";
      newAccount: SessionAccount;
    }
  | {
      type: "removed-account";
      accountDid: string;
    }
  | {
      type: "logged-out-current-account";
    }
  | {
      type: "logged-out-every-account";
    }
  | {
      type: "synced-accounts";
      syncedAccounts: SessionAccount[];
      syncedCurrentDid: string | undefined;
    };

export function getInitialState(persistedAccounts: SessionAccount[]): State {
  return {
    accounts: persistedAccounts,
    needsPersist: false,
  };
}

let reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "switched-to-account": {
      const { newAccount } = action;
      return {
        accounts: [
          newAccount,
          ...state.accounts.filter((a) => a.did !== newAccount.did),
        ],
        needsPersist: true,
      };
    }
    case "removed-account": {
      const { accountDid } = action;
      return {
        accounts: state.accounts.filter((a) => a.did !== accountDid),
        needsPersist: true,
      };
    }

    case "logged-out-current-account": {
      const { accounts } = state;
      return {
        accounts,
        needsPersist: true,
      };
    }
    case "logged-out-every-account": {
      return {
        accounts: state.accounts.map((a) => ({
          ...a,
          // Clear tokens for *every* account (this is a hard logout).
          refreshJwt: undefined,
          accessJwt: undefined,
        })),
        needsPersist: true,
      };
    }
    case "synced-accounts": {
      const { syncedAccounts, syncedCurrentDid } = action;
      return {
        accounts: syncedAccounts,
        needsPersist: false, // Synced from another tab. Don't persist to avoid cycles.
      };
    }
  }
};

reducer = wrapSessionReducerForLogging(reducer);
export { reducer };
