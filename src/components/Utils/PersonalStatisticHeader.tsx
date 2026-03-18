import useApiService from "@/composables/useApiService";
import type { UserResource } from "@/models/User";
import { useAuthStore } from "@/stores/auth";
import { computedAsync } from "@vueuse/core";
import { NGrid, NPageHeader, NSpace, NGi, NStatistic } from "naive-ui";
import {
  computed,
  defineComponent,
  inject,
  onMounted,
  reactive,
  ref,
} from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { UserInjectionKey } from "@/layouts/Dashboard/Default";

export default defineComponent({
  name: "PersonalStatisticHeader",
  setup(props, { emit }) {
    const user = inject<UserResource>(UserInjectionKey);
    return {
      user,
    };
  },
  render() {
    return (
      <div class={["flex-grow"]}>
        <NPageHeader
          v-slots={{
            title: () => {
              return (
                <RouterLink
                  to={"/dashboard/home"}
                  class={["hover:text-green-700"]}
                >
                  {this.$route.path !== "/dashboard/home" ? (
                    "Back to " +
                    (this.user as UserResource)?.name +
                    "'s dashboard"
                  ) : (
                    <span class={["font-bold"]}>
                      {"Hi, Welcome Back " + (this.user as UserResource)?.name}
                    </span>
                  )}
                </RouterLink>
              );
            },
          }}
          subtitle={
            "Youre logged in using " +
            (this.user as UserResource)?.email +
            " email"
          }
          onBack={() => {
            this.$router.back();
          }}
        >
          <NGrid xGap={10} cols={4}>
            <NGi
              class={[
                "bg-white rounded-md border border-green-300 shadow-xl shadow-green-100 p-3",
              ]}
            >
              <NStatistic
                label={"Last Login at "}
                value={this.user?.last_logged_in_at}
              />
              <NStatistic
                label={"Browser "}
                value={this.user?.last_logged_in_browser}
              />
              <NStatistic
                label={"Last Login at "}
                value={this.user?.last_logged_in_at}
              />
              <NStatistic
                label={"Last Login at "}
                value={this.user?.last_logged_in_at}
              />
            </NGi>
          </NGrid>
        </NPageHeader>
      </div>
    );
  },
});
