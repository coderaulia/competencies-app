import { useTitle } from "@vueuse/core";
import { computed } from "vue";
import { useRoute } from "vue-router";

/**
 * A custom composable helper function for generate document title proggrammatically
 *
 * @author ElhakimDev99
 * @date 12/1/2022 - 11:11:38
 */
const useDocumentTitle = () => {
  const route = useRoute();
  const routeTitleMeta = computed(() => route.meta.documentTitle);
  useTitle(routeTitleMeta, {
    titleTemplate: `%s | ${import.meta.env.VITE_APP_TITLE}`,
  });
};
export default useDocumentTitle;
