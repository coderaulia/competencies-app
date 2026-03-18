import { NForm, NFormItem, NInput } from "naive-ui";
import { defineComponent, computed, toRefs } from "vue";

export default defineComponent({
  name: "CompetencyLevelForm",
  props: {
    method: {
      type: String,
      default: "",
      required: true,
    },
    name: {
      type: String,
      default: "",
      required: true,
    },
    title: {
      type: String,
      default: "",
      required: true,
    },
    description: {
      type: String,
      default: "",
      required: true,
    },
  },
  emits: ["update:method", "update:name", "update:title", "update:description"],
  setup(props, { emit, expose }) {
    const { method, name, title, description } = toRefs(props);

    const method_ = computed({
      get: () => method.value,
      set: (value) => emit("update:method", value),
    });
    const name_ = computed({
      get: () => name.value,
      set: (value) => emit("update:name", value),
    });
    const title_ = computed({
      get: () => title.value,
      set: (value) => emit("update:title", value),
    });
    const description_ = computed({
      get: () => description.value,
      set: (value) => emit("update:description", value),
    });

    return {
      method_,
      name_,
      title_,
      description_,
    };
  },
  render() {
    return (
      <div>
        <NForm ref="FormInstRefs">
          <NFormItem label="Competency Level" labelPlacement="top">
            <NInput
              type="text"
              clearable
              v-model:value={this.title_}
              placeholder="Please input"
            />
          </NFormItem>
          <NFormItem label="Competency Level Name" labelPlacement="top">
            <NInput
              type="text"
              clearable
              v-model:value={this.name_}
              placeholder="Please input"
            />
          </NFormItem>
          <NFormItem label="Competency Level Description" labelPlacement="top">
            <NInput
              type="text"
              clearable
              v-model:value={this.description_}
              placeholder="Please input"
            />
          </NFormItem>
        </NForm>
      </div>
    );
  },
});
