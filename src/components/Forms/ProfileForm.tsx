import { NForm, NFormItem, NInput } from "naive-ui";
import { defineComponent, computed, toRefs } from "vue";

export default defineComponent({
  name: "UserForm",
  props: {
    name: {
      type: String,
      default: "",
      required: true,
    },
    guard: {
      type: String,
      default: "",
      required: true,
    },
  },
  emits: ["update:name", "update:guard"],
  setup(props, { emit, expose }) {
    const { name, guard } = toRefs(props);

    const name_ = computed({
      get: () => name.value,
      set: (value) => emit("update:name", value),
    });
    const guard_ = computed({
      get: () => guard.value,
      set: (value) => emit("update:guard", value),
    });

    return {
      name_,
      guard_,
    };
  },
  render() {
    return (
      <div>
        <NForm ref="FormInstRefs">
          <NFormItem label="Username" labelPlacement="top">
            <NInput
              type="text"
              clearable
              v-model:value={this.name_}
              placeholder="Please input"
            />
          </NFormItem>
          <NFormItem label="E-mail" labelPlacement="top">
            <NInput
              type="text"
              clearable
              v-model:value={this.guard_}
              placeholder="Please input"
            />
          </NFormItem>
        </NForm>
      </div>
    );
  },
});
