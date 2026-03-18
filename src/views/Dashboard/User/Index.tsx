import { onBeforeRouteLeave, onBeforeRouteUpdate } from "vue-router";
import {
  defineComponent,
  ref,
  provide,
  reactive,
  type Ref,
  onMounted,
  computed,
  watch,
  onBeforeUnmount,
  onBeforeMount,
} from "vue";
import { NSpace, NGi, NPageHeader, NGrid, NStatistic, NCard } from "naive-ui";
import DatatableServerSide from "@/components/Datatable/DatatableServerSide";
import { createUserDataTableColumns } from "@/utilities/datatable-utils/User";
import UserForm from "@/components/Forms/UserForm";
import FormModal from "@/components/Modal/FormModal";
import useApiService from "@/composables/useApiService";
import useFormModalProcessor from "@/composables/useFormModalProcessor";
import PageStatisticHeader from "@/components/Utils/PageStatisticHeader";
import usePageLoader from "@/composables/usePageLoader";
export type UserFromData = {
  name: Ref<string>;
  email: Ref<string>;
  password: Ref<string>;
  passwordConfirm: Ref<string>;
};
export default defineComponent({
  name: "UserIndex",
  setup() {
    const { loadingStart, loadingFinish } = usePageLoader();

    onBeforeMount(() => {
      loadingStart();
    });
    onMounted(() => {
      setTimeout(() => {
        loadingFinish();
      }, 500);
    });

    const backend = ref<string>("users");
    provide("backend", backend);

    const formData = reactive<UserFromData>({
      name: ref<string>(""),
      email: ref<string>(""),
      password: ref<string>(""),
      passwordConfirm: ref<string>(""),
    });

    const userFormRefs = ref<InstanceType<typeof UserForm> | null>(null);
    const userFromCardRefs = ref<InstanceType<typeof FormModal> | null>(null);
    const datatableRefs = ref<InstanceType<typeof DatatableServerSide> | null>(
      null
    );

    const {
      showFormModal,
      openModal,
      closeModal,
      setupPostAction,
      setupUpdateAction,
      processPostRequest,
      processPatchRequest,
      showSpinner,
      startSpinner,
      stopSpinner,
      formAction,
      flushFormData,
      formElement,
    } = useFormModalProcessor(backend.value);

    const formActionHandler = async () => {
      if (formAction.method === "POST")
        await processPostRequest(
          {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            password_confirmation: formData.passwordConfirm,
          },
          () => {
            datatableRefs.value?.reload();
            flushFormData(formData);
          },
          () => {}
        );

      if (formAction.method === "PATCH")
        await processPatchRequest(
          {
            name: formData.name,
            email: formData.email,
          },
          () => {
            datatableRefs.value?.reload();
            flushFormData(formData);
          },
          () => {}
        );
    };

    return {
      columns: createUserDataTableColumns(),
      backend,
      formData,
      showFormModal,
      openModal,
      closeModal,
      userFormRefs,
      userFromCardRefs,
      datatableRefs,
      formAction,
      setupPostAction,
      setupUpdateAction,
      processPostRequest,
      processPatchRequest,
      formActionHandler,
      flushFormData,
      showSpinner,
      startSpinner,
      stopSpinner,
      formElement,
    };
  },
  render() {
    const {
      columns,
      backend,
      formData,
      showFormModal,
      closeModal,
      formAction,
      setupPostAction,
      setupUpdateAction,
      formActionHandler,
      showSpinner,
      formElement,
    } = this;

    const title = computed(() => {
      return formElement.title;
    }).value;

    return (
      <div class={["flex flex-col px-6"]}>
        <PageStatisticHeader
          onClick:buttonCreate={() => {
            setupPostAction();
          }}
        />

        <DatatableServerSide
          ref="datatableRefs"
          path={backend}
          columns={columns}
          onTriggerUpdate={(id: any) => {
            (async () => {
              const { data } = await useApiService(`/${backend}/${id}`)
                .get()
                .json();
              setupUpdateAction(id, data, () => {
                formData.name = data.value.data.name;
                formData.email = data.value.data.email;
              });
            })();
          }}
        />

        <FormModal
          ref="userFormCardRefs"
          title={title}
          spin={showSpinner}
          v-model:show={showFormModal}
          onSubmit={formActionHandler}
          onCancel={() => {
            closeModal();
            formData.name = "";
            formData.email = "";
            formData.password = "";
            formData.passwordConfirm = "";
          }}
        >
          <UserForm
            ref="userFormRefs"
            v-model:method={formAction.method}
            v-model:name={formData.name}
            v-model:email={formData.email}
            v-model:password={formData.password}
            v-model:passwordConfirm={formData.passwordConfirm}
          />
        </FormModal>
      </div>
    );
  },
});
