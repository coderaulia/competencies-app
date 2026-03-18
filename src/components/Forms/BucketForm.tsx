import { NForm, NFormItem, NInput, NSwitch } from "naive-ui";
import { defineComponent, computed, toRefs } from "vue";

export default defineComponent({
  name: "BucketForm",
  props: {
    method: {
      type: String,
      default: "",
      required: true,
    },
    bucketName: {
      type: String,
      default: null,
      required: false,
    },
    bucketDescription: {
      type: String,
      default: null,
      required: false,
    },
    bucketHasPublicAccess: {
      type: [Number, String, Boolean],
      default: false,
      required: false,
    },
  },
  emits: [
    "update:method",
    "update:bucketName",
    "update:bucketDescription",
    "update:bucketHasPublicAccess",
  ],
  setup(props, { emit, expose }) {
    const { method, bucketName, bucketDescription, bucketHasPublicAccess } =
      toRefs(props);

    const method_ = computed({
      get: () => method.value,
      set: (value) => emit("update:method", value),
    });
    const bucketName_ = computed({
      get: () => bucketName.value,
      set: (value) => emit("update:bucketName", value),
    });
    const bucketDescription_ = computed({
      get: () => bucketDescription,
      set: (value) => emit("update:bucketDescription", value),
    });
    const bucketHasPublicAccess_ = computed({
      get: () => bucketHasPublicAccess.value,
      set: (value) => emit("update:bucketHasPublicAccess", value),
    });

    return {
      method_,
      bucketName_,
      bucketDescription_,
      bucketHasPublicAccess_,
    };
  },
  render() {
    return (
      <NForm ref="formInstanceRefs">
        <NFormItem label="Bucket Name" labelPlacement="top">
          <NInput
            type="text"
            clearable
            placeholder={"Input Bucket Name"}
            v-model:value={this.bucketName_}
            inputProps={{
              autocomplete: "off",
            }}
          />
        </NFormItem>
        <NFormItem label="Bucket Description" labelPlacement="top">
          <NInput
            type="text"
            clearable
            placeholder={"Input Bucket Description"}
            v-model:value={this.bucketDescription_}
            inputProps={{
              autocomplete: "off",
            }}
          />
        </NFormItem>
        <NFormItem label="Auto Activate ?" labelPlacement="top">
          <NSwitch v-model:value={this.bucketHasPublicAccess_} />
        </NFormItem>
      </NForm>
    );
  },
});
