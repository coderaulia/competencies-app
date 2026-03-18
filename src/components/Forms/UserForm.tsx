import { NForm, NFormItem, NInput } from "naive-ui";
import { defineComponent, computed, toRefs, inject } from "vue";

export default defineComponent({
  name: "UserForm",
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
    email: {
      type: String,
      default: "",
      required: true,
    },
    password: {
      type: String,
      default: "",
      required: true,
    },
    passwordConfirm: {
      type: String,
      default: "",
      required: true,
    },
  },
  emits: [
    "update:method",
    "update:name",
    "update:email",
    "update:password",
    "update:passwordConfirm",
  ],
  setup(props, { emit, expose }) {
    const { name, email, password, passwordConfirm, method } = toRefs(props);
    const method_ = computed({
      get: () => method.value,
      set: (value) => emit("update:method", value),
    });
    const name_ = computed({
      get: () => name.value,
      set: (value) => emit("update:name", value),
    });
    const email_ = computed({
      get: () => email.value,
      set: (value) => emit("update:email", value),
    });
    const password_ = computed({
      get: () => password.value,
      set: (value) => emit("update:password", value),
    });
    const passwordConfirm_ = computed({
      get: () => passwordConfirm.value,
      set: (value) => emit("update:passwordConfirm", value),
    });

    return {
      method_,
      name_,
      email_,
      password_,
      passwordConfirm_,
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
              placeholder="Username"
              inputProps={{
                autocomplete: "off",
              }}
            />
          </NFormItem>
          <NFormItem label="E-mail" labelPlacement="top">
            <NInput
              type="text"
              clearable
              v-model:value={this.email_}
              placeholder="E-mail"
              inputProps={{
                autocomplete: "new-email",
              }}
            />
          </NFormItem>

          {this.method !== "PATCH" ? (
            <>
              <NFormItem label="Password" labelPlacement="top">
                <NInput
                  type="password"
                  clearable
                  showPasswordOn={"click"}
                  disabled={this.method_ === "PATCH"}
                  v-model:value={this.password_}
                  placeholder={
                    this.method_ === "POST"
                      ? "Password"
                      : "Password field is readonly"
                  }
                  inputProps={{
                    autocomplete: "new-password",
                  }}
                />
              </NFormItem>
              <NFormItem label="Password Confirmation" labelPlacement="top">
                <NInput
                  type="password"
                  clearable
                  showPasswordOn={"click"}
                  disabled={this.method_ === "PATCH"}
                  v-model:value={this.passwordConfirm_}
                  placeholder={
                    this.method_ === "POST"
                      ? "Password Confirmation"
                      : "Password Confirmation field is readonly"
                  }
                  inputProps={{
                    autocomplete: "new-password",
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
