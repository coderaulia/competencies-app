import { defineComponent } from "vue";
import { RouterView } from "vue-router";

export default defineComponent({
  name: "AuthenticationDefault",
  setup() {
    return {};
  },
  render() {
    return (
      // <div class={['flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-100']}>
      <div
        class={[
          "flex min-h-screen space-y-8 items-center justify-center py-12 px-2 sm:px-6 lg:px-8",
        ]}
      >
        <RouterView />
      </div>
      // </div>
    );
  },
});
