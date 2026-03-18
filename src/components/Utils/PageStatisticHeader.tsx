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
  name: "PageStatisticHeader",
  emits: ["click:buttonCreate"],
  setup(props, { emit }) {
    const route = useRoute();
    const store = useAuthStore();

    const userId = computed(() => {
      // @ts-ignore
      return store.$state.user?.id;
    });

    // const username = ref<string | null>(null);
    // const user: UserResource | {} = reactive({} as UserResource);

    // onMounted(() => {
    //   (async () => {
    //     const {
    //       data, statusCode
    //     } = await useApiService("users/" + userId.value).get().json();
    //     if(statusCode.value === 200){

    //       // user = data.value as UserResource;
    //       Object.assign(user, data.value.data as UserResource)
    //       console.log(user);
    //     }
    //   })()
    // })
    const user = inject<UserResource>(UserInjectionKey);

    const resources = route.path !== "/dashboard/home" ? inject("backend") : "";
    return {
      emit,
      resources,
      store,
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
                    "Back to " + this.user?.name + "'s dashboard"
                  ) : (
                    <span class={["font-bold"]}>
                      {"Hi, Welcome Back " + this.user?.name}
                    </span>
                  )}
                </RouterLink>
              );
            },
            extra: () => {
              return (
                <div>
                  {this.$route.path !== "/dashboard/home" ? (
                    <NSpace>
                      <button
                        onClick={() => {
                          this.emit("click:buttonCreate");
                        }}
                        class={[
                          "inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm",
                        ]}
                      >
                        Create new {this.resources}
                      </button>
                    </NSpace>
                  ) : (
                    ""
                  )}
                </div>
              );
            },
          }}
          subtitle={"Youre logged in using " + this.user?.email + " email"}
          onBack={() => {
            this.$router.back();
          }}
        ></NPageHeader>
      </div>
    );
  },
});
