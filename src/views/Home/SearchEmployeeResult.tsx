import useApiService from "@/composables/useApiService";
import type { EmploymentResource } from "@/models/Employment";
import { NPageHeader } from "naive-ui";
import { defineComponent, onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { RenderExpandableColumn as EmploymentDetail } from "@/utilities/datatable-utils/Employment";
export default defineComponent({
  name: "SearchEmployeeResult",
  setup(props, {}) {
    const employment = ref<EmploymentResource | unknown>(null);

    const route = useRoute();

    const initialize = async () => {
      const { data, statusCode } = await useApiService(
        "employments_autocomplete_options/" + route.params.id
      )
        .get()
        .json();
      if (statusCode.value === 200) {
        employment.value = data.value.data as EmploymentResource;
      }
    };

    onMounted(() => {
      initialize();
    });
    return {
      employment,
    };
  },
  render() {
    const { employment } = this;
    return (
      <div class="font-sans subpixel-antialiased isolate bg-white h-screen overflow-auto">
        <div class="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]">
          <svg
            class="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
            viewBox="0 0 1155 678"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
              fill-opacity=".3"
              d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
            />
            <defs>
              <linearGradient
                id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
                x1="1155.49"
                x2="-78.208"
                y1=".177"
                y2="474.645"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#9089FC"></stop>
                <stop offset="1" stop-color="#FF80B5"></stop>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="px-6 pt-6 lg:px-8">
          <div>
            <nav
              class="flex h-9 items-center justify-between"
              aria-label="Global"
            >
              <div class="flex lg:min-w-0 lg:flex-1" aria-label="Global">
                <a href="#" class="-m-1.5 p-1.5">
                  <span class="sr-only">Your Company</span>
                  <img
                    class="h-8"
                    src="https://tailwindui.com/img/logos/mark.svg?color=green&shade=600"
                    alt=""
                  />
                </a>
              </div>
              <div class="flex lg:hidden">
                <button
                  type="button"
                  class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-green-700"
                >
                  <span class="sr-only">Open main menu</span>
                  <svg
                    class="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                </button>
              </div>
              <div class="hidden lg:flex lg:min-w-0 lg:flex-1 lg:justify-center lg:gap-x-12">
                {/* <a
                  href="#"
                  class="font-semibold text-green-900 hover:text-green-900"
                >
                  Product
                </a>

                <a
                  href="#"
                  class="font-semibold text-green-900 hover:text-green-900"
                >
                  Features
                </a>

                <a
                  href="#"
                  class="font-semibold text-green-900 hover:text-green-900"
                >
                  Marketplace
                </a>

                <a
                  href="#"
                  class="font-semibold text-green-900 hover:text-green-900"
                >
                  Company
                </a> */}
              </div>
              <div class="hidden lg:flex lg:min-w-0 lg:flex-1 lg:justify-end">
                <RouterLink
                  class={[
                    "inline-block rounded-lg px-3 py-1.5 text-sm font-semibold leading-6 text-green-900 shadow-sm ring-1 ring-green-900/10 hover:ring-green-900/20",
                  ]}
                  to={"/authentication/login"}
                >
                  {" "}
                  Login{" "}
                </RouterLink>
              </div>
            </nav>
            <div role="dialog" aria-modal="true">
              <div class="fixed inset-0 z-10 overflow-y-auto bg-white px-6 py-6 lg:hidden">
                <div class="flex h-9 items-center justify-between">
                  <div class="flex">
                    <a href="#" class="-m-1.5 p-1.5">
                      <span class="sr-only">Your Company</span>
                      <img
                        class="h-8"
                        src="https://tailwindui.com/img/logos/mark.svg?color=green&shade=600"
                        alt=""
                      />
                    </a>
                  </div>
                  <div class="flex">
                    <button
                      type="button"
                      class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-green-700"
                    >
                      <span class="sr-only">Close menu</span>
                      <svg
                        class="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="mt-6 flow-root">
                  <div class="-my-6 divide-y divide-green-500/10">
                    <div class="space-y-2 py-6">
                      {/* <a
                        href="#"
                        class="-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7 text-green-900 hover:bg-green-400/10"
                      >
                        Product
                      </a>

                      <a
                        href="#"
                        class="-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7 text-green-900 hover:bg-green-400/10"
                      >
                        Features
                      </a>

                      <a
                        href="#"
                        class="-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7 text-green-900 hover:bg-green-400/10"
                      >
                        Marketplace
                      </a>

                      <a
                        href="#"
                        class="-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7 text-green-900 hover:bg-green-400/10"
                      >
                        Company
                      </a> */}
                    </div>
                    <div class="py-6">
                      <a
                        href="#"
                        class="-mx-3 block rounded-lg py-2.5 px-3 text-base font-semibold leading-6 text-green-900 hover:bg-green-400/10"
                      >
                        Log in
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <main>
          <div class="relative px-6 py-4 lg:px-8">
            <RenderPageHeader />
            {/* @ts-ignore */}
            <EmploymentDetail data={employment} />
            <div class="mx-auto max-w-3xl">
              <div>
                <div class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
                  <svg
                    class="relative left-[calc(50%+3rem)] h-[21.1875rem] max-w-none -translate-x-1/2 sm:left-[calc(50%+36rem)] sm:h-[42.375rem]"
                    viewBox="0 0 1155 678"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="url(#ecb5b0c9-546c-4772-8c71-4d3f06d544bc)"
                      fill-opacity=".3"
                      d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
                    />
                    <defs>
                      <linearGradient
                        id="ecb5b0c9-546c-4772-8c71-4d3f06d544bc"
                        x1="1155.49"
                        x2="-78.208"
                        y1=".177"
                        y2="474.645"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stop-color="#9089FC"></stop>
                        <stop offset="1" stop-color="#FF80B5"></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  },
});

export const RenderPageHeader = defineComponent({
  render() {
    return (
      <NPageHeader
        class={["py-8"]}
        onBack={() => {
          this.$router.back();
        }}
        v-slots={{
          title: () => {
            return (
              <RouterLink to={"/welcome-app"} class={["hover:text-green-700"]}>
                {this.$route.path !== "/dashboard/home"
                  ? "Back to Homepage"
                  : "Welcome to username / email"}
              </RouterLink>
            );
          },
        }}
      />
    );
  },
});
