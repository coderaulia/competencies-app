import { defineComponent } from "vue";
import { NCard, NEmpty, NButton } from "naive-ui";
/**
 * Render empty bucket
 */
export const RenderEmptyBucket = defineComponent({
  name: "RenderEmptyBucket",
  emits: ["createNewBucket"],
  setup(props, { emit }) {
    function onCreateNewBucket() {
      emit("createNewBucket");
    }
    return {
      onCreateNewBucket,
    };
  },
  render() {
    const { onCreateNewBucket } = this;
    return (
      <NCard class={["min-h-screen flex flex-row items-center"]}>
        <NEmpty
          size="large"
          description="There is no available bucket's yet"
          v-slots={{
            extra: () => (
              <NButton size="small" onClick={onCreateNewBucket}>
                Create Your Buckets
              </NButton>
            ),
          }}
        />
      </NCard>
    );
  },
});
