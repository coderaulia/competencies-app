import { defineComponent, toRefs } from "vue";

export default defineComponent({
  name: "BucketListHeader",
  props: {
    title: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { title, subTitle } = toRefs(props);
    return { title, subTitle };
  },
  render() {
    return (
      <div class={["flex flex-col gap-y-4"]}>
        <div class={["flex items-start justify-between gap-4"]}>
          <div class={["flex items-start gap-3"]}>
            <img
              srcset="https://cdn1.iconfinder.com/data/icons/essentials-41/32/17_Folder-1024.png"
              alt=""
              class={["w-8 h-8 mt-1"]}
            />
            <div class={["flex flex-col gap-y-1"]}>
              <h2 class={["text-xl font-semibold text-slate-900"]}>
                {this.title}
              </h2>
              <p class={["text-sm text-slate-500"]}>{this.subTitle}</p>
            </div>
          </div>
          <span class={["text-xs text-slate-400 whitespace-nowrap"]}>
            {`As of ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`}
          </span>
        </div>
        {this.$slots.default?.()}
      </div>
    );
  },
});
