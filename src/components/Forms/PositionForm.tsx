import { NForm, NFormItem, NInput } from "naive-ui";
import { defineComponent, computed, toRefs } from "vue";

export default defineComponent({
  name: "PositionForm",
  props: {
    name: {
      type: String,
      default: "",
      required: true,
    },
  },
  emits: ["update:name"],
  setup(props, { emit, expose }) {
    const { name } = toRefs(props);

    const name_ = computed({
      get: () => name.value,
      set: (value) => emit("update:name", value),
    });

    return {
      name_,
    };
  },
  render() {
    return (
      <div>
        <NForm ref="FormInstRefs">
          <NFormItem label="Position Name" labelPlacement="top">
            <NInput
              type="text"
              clearable
              v-model:value={this.name_}
              placeholder="Please input"
            />
          </NFormItem>
        </NForm>
      </div>
    );
  },
});
