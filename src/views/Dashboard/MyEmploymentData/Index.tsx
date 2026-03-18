import { defineComponent, Suspense } from "vue";
import { RouterView } from "vue-router";
export default defineComponent({
  name: "MyEmploymentDataIndex",
  setup() {
    return [];
  },
  render() {
    return (
      // <Suspense v-slots={{
      //   default: () => <RouterView />,
      //   fallback: () => (
      //     <div>
      //       "loading ............."
      //     </div>
      //   )
      // }}/>
      <RouterView />
    );
  },
});
