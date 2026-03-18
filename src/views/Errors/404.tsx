import { defineComponent } from "vue";

export default defineComponent({
  name: "NotFound",
  render() {
    return (
      <div>
        <div class="max-w-screen h-screen flex flex-row items-center justify-center text-emerald-900">
          <div class="w-1/2 h-auto flex flex-col space-y-4">
            <div class="grid grid-cols-3 divide-x-2 divide-emerald-700">
              <div class="col-start-1">
                <div class="container px-5 flex justify-end">
                  <h1 class="font-extrabold text-6xl text-ellipsis">500</h1>
                </div>
              </div>
              <div class="col-span-2 space-y-2">
                <div class="container px-5 flex justify-start">
                  <h1 class="font-extrabold text-6xl text-ellipsis">
                    Not Found
                  </h1>
                </div>
                <div class="container px-5 flex justify-start">
                  <h2 class="font-semibold text-normal text-ellipsis text-emerald-700">
                    Sorry. This page will be cooming back soon!
                  </h2>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-3 divide-x-2 divide-emerald-700">
              <div class="col-start-2 col-span-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
