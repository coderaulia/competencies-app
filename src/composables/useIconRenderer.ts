import { NIcon } from "naive-ui";
import { type Component, h } from "vue";

/**
 * Composable for rendering icon component
 *
 * All icons that being used for this project is available at : https://www.xicons.org/
 *
 * @see https://www.naiveui.com/en-US/os-theme/components/icon
 *
 * @date 12/1/2022 - 11:12:44
 *
 * @param {Component} icon
 * @returns {() => any}
 */
const useIconRenderer = (icon: Component) => {
  return () =>
    h(NIcon, null, {
      default: () => h(icon),
    });
};
export default useIconRenderer;
