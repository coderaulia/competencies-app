import type { Prop, PropType } from "vue";
import type { Option, Theme, InitOptions, UpdateOptions } from "./types";
import { autoresizeProps, loadingProps } from "./hooks";

export default {
  option: {
    type: Object as PropType<Option>,
    required: true,
  },
  theme: {
    type: [Object, String] as PropType<Theme>,
    required: false,
  },
  initOptions: {
    type: Object as PropType<InitOptions>,
    required: true,
  },
  updateOptions: {
    type: Object as PropType<UpdateOptions>,
    required: false,
  },
  group: {
    type: String,
    required: false,
  },
  manualUpdate: {
    type: Boolean,
    required: false,
  },
  ...autoresizeProps,
  ...loadingProps,
};
