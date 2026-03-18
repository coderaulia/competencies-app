import { useLoadingBar } from "naive-ui";

/**
 * Compossable function forr initiate loading bar progress in each asynchronous action to make better UX for user.
 *
 * here is customisation made by me based on top of : naive-ui
 *
 * @see https://www.naiveui.com/en-US/os-theme/components/loading-bar for more detailed usage
 * @date 12/1/2022 - 11:15:00
 *
 * @returns {{ loadingStart(): void; loadingError(): void; loadingFinish(): void; }}
 */
const usePageLoader = () => {
  const loading = useLoadingBar();
  return {
    loadingStart() {
      loading.start();
    },
    loadingError() {
      loading.error();
    },
    loadingFinish() {
      loading.finish();
    },
  };
};
export default usePageLoader;
