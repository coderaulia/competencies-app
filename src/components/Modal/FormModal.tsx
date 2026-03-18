import {
  computed,
  defineComponent,
  inject,
  onMounted,
  toRefs,
  type Ref,
} from "vue";
import { NModal, NCard, NSpin, NScrollbar } from "naive-ui";
import useFormModalProcessor from "@/composables/useFormModalProcessor";

export default defineComponent({
  name: "FormModal",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
    },
    spin: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["submit", "cancel", "close", "toogle"],
  setup(props, { slots, emit }) {
    const { show, title, spin } = toRefs(props);
    const show_ = computed(() => show.value);
    const title_ = computed(() => title.value);
    const spin_ = computed(() => spin.value);
    return {
      slots,
      emit,
      show_,
      title_,
      spin_,
    };
  },
  render() {
    const { slots, emit } = this;
    return (
      <NModal v-model:show={this.show_} role={"dialog"} aria-modal={true}>
        <NCard
          style={"width: 600px"}
          title={this.title_}
          bordered={false}
          size={"huge"}
          role={"dialog"}
          aria-modal={true}
          closable
          onClose={() => {
            emit("cancel");
          }}
          // headerStyle={{
          //   backgroundColor: "white",
          // }}
          class={[""]}
          segmented={{
            content: true,
          }}
        >
          {{
            default: () => (
              <NSpin v-model:show={this.spin_}>
                <NScrollbar style="max-height: 500px" trigger="hover">
                  {/* @ts-ignore */}
                  {slots.default()}
                </NScrollbar>
              </NSpin>
            ),
            action: () => (
              <div class={[""]}>
                <div class={["sm:flex sm:flex-row-reverse sm:px-6"]}>
                  <button
                    onClick={() => {
                      emit("submit");
                    }}
                    class={[
                      "inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm",
                    ]}
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => {
                      emit("cancel");
                    }}
                    class={[
                      "mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm",
                    ]}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ),
          }}
        </NCard>
      </NModal>
    );
  },
});
