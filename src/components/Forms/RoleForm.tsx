import { NForm, NFormItem, NInput } from "naive-ui";
import { defineComponent, computed, toRefs } from "vue";

export default defineComponent({
  name: "RoleForm",
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
    guard: {
      type: String,
      default: "",
      required: true,
    },
  },
  emits: ["update:method", "update:name", "update:guard"],
  setup(props, { emit, expose }) {
    const { method, name, guard } = toRefs(props);

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

    return {
      method_,
      name_,
      guard_,
    };
  },
  render() {
    return (
      <div>
        <NForm ref="FormInstRefs">
          <NFormItem label="Role Name" labelPlacement="top">
            <NInput
              type="text"
              clearable
              v-model:value={this.name_}
              placeholder={"Role name"}
              inputProps={{
                autocomplete: "off",
              }}
            />
          </NFormItem>
          {this.method !== "PATCH" ? (
            <>
              <NFormItem label="Role Guard" labelPlacement="top">
                <NInput
                  type="text"
                  clearable
                  disabled={this.method_ === "PATCH"}
                  v-model:value={this.guard_}
                  placeholder={
                    this.method_ === "POST"
                      ? "Role guard"
                      : "Role guard field is readonly"
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
