import { acceptHMRUpdate, defineStore } from "pinia";
export type UserState = {
  id: number | null;
  name?: string | null;
  email?: string | null;
};
export type AuthorizationState = {
  expires_in: string | null;
  access_token: string | null;
};
export interface IAuthenticateUserRequest {
  email: string;
  password: string;
}
export interface ICreateNewUserRequest {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}
export interface AuthState {
  isAuthenticated: boolean;
  user: UserState | null;
  authorization: AuthorizationState | null;
  roles: [];
  permissions: [];
}

const InitialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  authorization: null,
  roles: [],
  permissions: [],
};

export const useAuthStore = defineStore("useAuthStore", {
  persist: {
    storage: sessionStorage,
    paths: ["authorization.access_token", "user", "roles", "permissions"],
  },
  state: (): AuthState => ({
    ...InitialAuthState,
  }),
  actions: {
    fill(
      status: boolean,
      user: UserState | null,
      authorization: AuthorizationState | null,
      roles: [],
      permissions: []
    ) {
      const id = user?.id;
      const name = user?.name;
      const email = user?.email;
      const auth_access_token = authorization?.access_token;
      const expires_in = authorization?.expires_in;

      this.$patch({
        authorization: {
          access_token: auth_access_token,
          expires_in: expires_in,
        },
        isAuthenticated: status,
        user: {
          id: id,
          name: name ?? null,
          email: email ?? null,
        },
        roles: [...roles],
        permissions: [...permissions],
      });
    },
    onLoginSuccess(
      user: UserState,
      authorization: AuthorizationState,
      roles: [],
      permissions: []
    ) {
      this.fill(true, user, authorization, roles, permissions);
    },
    onLoginFailed() {
      this.fill(false, null, null, [], []);
    },
    onLogoutSuccess() {
      this.fill(false, null, null, [], []);
    },
    onLogoutFailed() {
      this.fill(false, null, null, [], []);
    },
  },
  getters: {
    access_token: (state) => state.authorization?.access_token,
    access_token_expires_in_time: (state) =>
      new Date(state.authorization?.expires_in as string).toLocaleDateString() +
      " " +
      new Date(state.authorization?.expires_in as string).toLocaleTimeString(),
  },
});
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
