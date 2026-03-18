import {
  defineComponent,
  toRefs,
  type InjectionKey,
  type EmitsOptions,
  shallowRef,
  inject,
  computed,
  getCurrentInstance,
  nextTick,
  onMounted,
  onBeforeMount,
  onBeforeUnmount,
  watch,
  watchEffect,
  h,
} from "vue";
import apacheEchartProps from "./apache-echart-props";
import type {
  EChartsType,
  InitOptionsInjection,
  ThemeInjection,
  UpdateOptionsInjection,
  Emits,
  Option,
  UpdateOptions,
} from "./types";
import { register, type EChartsElement, TAG_NAME } from "./wc";
import { omitOn, unwrapInjected } from "./utils";
import { init as initEChart } from "echarts/core";
import { useAutoresize, useLoading, usePublicAPI } from "./hooks";

const __CSP__ = false;
const wcRegistered = __CSP__ ? false : register();

export const THEME_KEY = "ecTheme" as unknown as InjectionKey<ThemeInjection>;
export const INIT_OPTIONS_KEY =
  "ecInitOptions" as unknown as InjectionKey<InitOptionsInjection>;
export const UPDATE_OPTIONS_KEY =
  "ecUpdateOptions" as unknown as InjectionKey<UpdateOptionsInjection>;
export { LOADING_OPTIONS_KEY } from "./hooks";

export default defineComponent({
  name: "apache-echart-vue3",
  props: apacheEchartProps,
  emits: {} as unknown as Emits,
  inheritAttrs: false,
  setup(props, { attrs }) {
    // setup reactive data
    const root = shallowRef<EChartsElement>();
    const chart = shallowRef<EChartsType>();
    const option = shallowRef<Option>();
    const theme = inject(THEME_KEY, null);
    const initOptions = inject(INIT_OPTIONS_KEY, null);
    const updateOptions = inject(UPDATE_OPTIONS_KEY, null);

    // props to ref transform
    const { autoresize, manualUpdate, loading, loadingOptions } = toRefs(props);

    // internal computed props
    const option_ = computed(() => option.value || props.option || null);
    const theme_ = computed(() => props.theme || unwrapInjected(theme, {}));
    const initOptions_ = computed(
      () => props.initOptions || unwrapInjected(initOptions, {})
    );
    const updateOptions_ = computed(
      () => props.updateOptions || unwrapInjected(updateOptions, {})
    );
    const nonEventAttrs = computed(() => omitOn(attrs));

    // @ts-expect-error listeners for Vue 2 compatibility
    const listeners = getCurrentInstance().proxy.$listeners;

    // methods definitions
    function init(option?: Option) {
      if (!root.value) {
        return;
      }

      const instance = (chart.value = initEChart(
        root.value,
        theme_.value,
        initOptions_.value
      ));

      if (props.group) {
        instance.group = props.group;
      }

      let listeners_ = listeners;

      if (!listeners_) {
        listeners_ = {};
      }

      Object.keys(attrs)
        .filter((key) => key.indexOf("on") === 0 && key.length > 2)
        .forEach((key) => {
          let event = key.charAt(2).toLowerCase() + key.slice(3);

          if (event.substring(event.length - 4) === "Once") {
            event = `~${event.substring(0, event.length - 4)}`;
          }

          listeners_[event] = attrs[key];
        });

      Object.keys(listeners_).forEach((key) => {
        let handler = listeners_[key];

        if (!handler) {
          return;
        }

        let event = key.toLowerCase();

        if (event.charAt(0) === "~") {
          event = event.substring(1);
          handler.__once__ = true;
        }

        // @ts-ignore
        let target: EventTarget = instance;

        if (event.indexOf("zr:") === 0) {
          // @ts-ignore
          target = instance.getZr();
          event = event.substring(3);
        }

        if (handler.__once__) {
          delete handler.__once__;

          const raw = handler;

          handler = (...args: any[]) => {
            raw(...args);
            // @ts-ignore
            target.off(event, handler);
          };
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore EChartsType["on"] is not compatible with ZRenderType["on"]
        // but it's okay here
        target.on(event, handler);
      });

      function resize() {
        if (instance && !instance.isDisposed()) {
          instance.resize();
        }
      }

      function commit() {
        const opt = option || option_.value;
        if (opt) {
          instance.setOption(opt, updateOptions_.value);
        }
      }

      if (autoresize.value) {
        // Try to make chart fit to container in case container size
        // is changed synchronously or in already queued microtasks
        nextTick(() => {
          resize();
          commit();
        });
      } else {
        commit();
      }
    }

    function setOption(option: Option, updateOptions?: UpdateOptions) {
      if (props.manualUpdate) {
        option.value = option;
      }

      if (!chart.value) {
        init(option);
      } else {
        chart.value.setOption(option, updateOptions || {});
      }
    }

    function cleanup() {
      if (chart.value) {
        chart.value.dispose();
        chart.value = undefined;
      }
    }

    let unwatchOption: (() => void) | null = null;
    watch(
      manualUpdate,
      (manualUpdate) => {
        if (typeof unwatchOption === "function") {
          unwatchOption();
          unwatchOption = null;
        }

        if (!manualUpdate) {
          unwatchOption = watch(
            () => props.option,
            (option, oldOption) => {
              if (!option) {
                return;
              }
              if (!chart.value) {
                init();
              } else {
                chart.value.setOption(option, {
                  // mutating `option` will lead to `notMerge: false` and
                  // replacing it with new reference will lead to `notMerge: true`
                  notMerge: option !== oldOption,
                  ...updateOptions_.value,
                });
              }
            },
            { deep: true }
          );
        }
      },
      {
        immediate: true,
      }
    );

    watch(
      [theme_, initOptions_],
      () => {
        cleanup();
        init();
      },
      {
        deep: true,
      }
    );

    watchEffect(() => {
      if (props.group && chart.value) {
        chart.value.group = props.group;
      }
    });

    const publicApi = usePublicAPI(chart);

    useLoading(chart, loading, loadingOptions);

    useAutoresize(chart, autoresize, root);

    onMounted(() => {
      init();
    });

    onBeforeUnmount(() => {
      if (wcRegistered && root.value) {
        // For registered web component, we can leverage the
        // `disconnectedCallback` to dispose the chart instance
        // so that we can delay the cleanup after exsiting leaving
        // transition.
        root.value.__dispose = cleanup;
      } else {
        cleanup();
      }
    });

    return {
      chart,
      root,
      setOption,
      nonEventAttrs,
      ...publicApi,
    };
  },
  render() {
    const attrs = {
      ...this.nonEventAttrs,
    };
    attrs.ref = "root";
    attrs.class = attrs.class ? ["echarts"].concat(attrs.class) : "echarts";
    return h(TAG_NAME, attrs);
  },
});
