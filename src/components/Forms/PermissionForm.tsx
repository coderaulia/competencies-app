import { NForm, NFormItem, NInput } from "naive-ui";
import { defineComponent, computed, toRefs } from "vue";

export default defineComponent({
  name: "PermissionForm",
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
    group: {
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
  emits: ["update:method", "update:name", "update:group", "update:guard"],
  setup(props, { emit, expose }) {
    const { method, name, group, guard } = toRefs(props);
    const method_ = computed({
      get: () => method.value,
      set: (value) => emit("update:method", value),
    });
    const name_ = computed({
      get: () => name.value,
      set: (value) => emit("update:name", value),
    });
    const guard_ = computed({
      get: () => guard.value,
      set: (value) => emit("update:guard", value),
    });
    const group_ = computed({
      get: () => group.value,
      set: (value) => emit("update:group", value),
    });

    return {
      method_,
      name_,
      group_,
      guard_,
    };
  },
  render() {
    return (
      <div>
        <NForm ref="FormInstRefs">
          <NFormItem label="Permission Name" labelPlacement="top">
            <NInput
              type="text"
              clearable
              v-model:value={this.name_}
              placeholder="Permission name"
            />
          </NFormItem>
          <NFormItem label="Permission Group" labelPlacement="top">
            <NInput
              type="text"
              clearable
              v-model:value={this.group_}
              placeholder="Permission group"
            />
          </NFormItem>
          {this.method !== "PATCH" ? (
            <>
              <NFormItem label="Permission Guard" labelPlacement="top">
                <NInput
                  type="text"
                  clearable
                  v-model:value={this.guard_}
                  placeholder={
                    this.method_ === "POST"
                      ? "Permission guard"
                      : "Permission guard field is readonly"
                  }
                  inputProps={{
                    autocomplete: "off",
                  }}
                />
              </NFormItem>
            </>
          ) : (
            ""
          )}
        </NForm>
      </div>
    );
  },
});
