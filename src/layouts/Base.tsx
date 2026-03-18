import { defineComponent } from "vue";
import { RouterView, useRouter } from "vue-router";
import useDocumentTitle from "@/composables/useDocumentTitle";
export default defineComponent({
  name: "BaseLayout",
  setup() {
    useDocumentTitle();

    return {};
  },
  render() {
    return <RouterView />;
  },
});
