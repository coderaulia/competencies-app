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
  name: "DetailModal",
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
  setup(props, { emit }) {
    const { show, title, spin } = toRefs(props);
    const show_ = computed(() => show.value);
    const title_ = computed(() => title.value);
    const spin_ = computed(() => spin.value);
    return {
      emit,
      show_,
      title_,
      spin_,
    };
  },
  render() {
    const { emit } = this;
    return (
      <NModal v-model:show={this.show_} role={"dialog"} aria-modal={true}>
        <NCard
          style={"width: 1240px"}
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
                  {this.$slots.default?.()}
                </NScrollbar>
              </NSpin>
            ),
          }}
        </NCard>
      </NModal>
    );
  },
});
