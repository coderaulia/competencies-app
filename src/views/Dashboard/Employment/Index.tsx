import DatatableServerSide from "@/components/Datatable/DatatableServerSide";
import EmploymentForm from "@/components/Forms/EmploymentForm";
import FormModal from "@/components/Modal/FormModal";
import PageStatisticHeader from "@/components/Utils/PageStatisticHeader";
import useApiService from "@/composables/useApiService";
import useFormModalProcessor from "@/composables/useFormModalProcessor";
import usePageLoader from "@/composables/usePageLoader";
import { createEmploymentDatatableColumn } from "@/utilities/datatable-utils/Employment";
import ExcelImporter from "@/components/Datatable/Uploader/ExcelImporter";

import {
  defineComponent,
  onMounted,
  onBeforeMount,
  ref,
  provide,
  type Ref,
  reactive,
  computed,
  watch,
  watchEffect,
} from "vue";
import { watchDebounced } from "@vueuse/core";
import { NSelect } from "naive-ui";
export type EmploymentFormData = {
  employmentHiringDate: Ref<string | number | null>;
  employmentEndDate: Ref<string | number | null>;
  employmentGroupTypeName: Ref<string | null>;
  employmentGroupAge: Ref<string | null>;
  employmentStatus: Ref<string | null>;
  employmentPositionStatus: Ref<string | null>;
  employmentWsr: Ref<string | null>;
  parentEmploymentId?: Ref<number | null>;
  profileId: Ref<number | null>;
  positionId: Ref<number | null>;
  companyId: Ref<number | null>;
  directoratId: Ref<number | null>;
  personelAreaId: Ref<number | null>;
  personelSubAreaId: Ref<number | null>;
  plantAreaId: Ref<number | null>;
};
export default defineComponent({
  name: "EmploymentIndex",
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

    const backend = ref<string>("employments");
    provide("backend", backend);

    const formData = reactive<EmploymentFormData>({
      employmentHiringDate: ref<string | null>(null),
      employmentEndDate: ref<string | null>(null),
      employmentGroupTypeName: ref<string | null>(null),
      employmentGroupAge: ref<string | null>(null),
      employmentStatus: ref<string | null>(null),
      employmentPositionStatus: ref<string | null>(null),
      employmentWsr: ref<string | null>(null),
      parentEmploymentId: ref<number | null>(null),
      profileId: ref<number | null>(null),
      positionId: ref<number | null>(null),
      companyId: ref<number | null>(null),
      directoratId: ref<number | null>(null),
      personelAreaId: ref<number | null>(null),
      personelSubAreaId: ref<number | null>(null),
      plantAreaId: ref<number | null>(null),
    });

    const employmentFormRefs = ref<InstanceType<typeof EmploymentForm> | null>(
      null
    );
    const employmentFromCardRefs = ref<InstanceType<typeof FormModal> | null>(
      null
    );
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
        console.log(formData.employmentHiringDate);
      await processPostRequest(
        {
          employment_hiring_date:
            (formData.employmentHiringDate as number) / 1000,
          employment_end_date: (formData.employmentEndDate as number) / 1000,
          employment_group_type_name: formData.employmentGroupTypeName,
          employment_group_age: formData.employmentGroupAge,
          employment_status: formData.employmentStatus,
          employment_position_status: formData.employmentPositionStatus,
          employment_wsr: formData.employmentWsr,
          parent_employment_id: formData.parentEmploymentId,
          profile_id: formData.profileId,
          position_id: formData.positionId,
          company_id: formData.companyId,
          directorat_id: formData.directoratId,
          personel_area_id: formData.personelAreaId,
          personel_sub_area_id: formData.personelSubAreaId,
          plant_area_id: formData.plantAreaId,
        },
        () => {
          datatableRefs.value?.reload();
          flushFormData(formData, null);
        },
        () => {}
      );

      if (formAction.method === "PATCH")
        await processPatchRequest(
          {
            employment_hiring_date:
              (formData.employmentHiringDate as number) / 1000,
            employment_end_date: (formData.employmentEndDate as number) / 1000,
            employment_group_type_name: formData.employmentGroupTypeName,
            employment_group_age: formData.employmentGroupAge,
            employment_status: formData.employmentStatus,
            employment_position_status: formData.employmentPositionStatus,
            employment_wsr: formData.employmentWsr,
            parent_employment_id: formData.parentEmploymentId,
            profile_id: formData.profileId,
            position_id: formData.positionId,
            company_id: formData.companyId,
            directorat_id: formData.directoratId,
            personel_area_id: formData.personelAreaId,
            personel_sub_area_id: formData.personelSubAreaId,
            plant_area_id: formData.plantAreaId,
          },
          () => {
            datatableRefs.value?.reload();
            flushFormData(formData);
          },
          () => {}
        );
    };

    const uploadEmploymentComponentRefs = ref<InstanceType<
      typeof ExcelImporter
    > | null>(null);

    const uploadActionPath = ref(backend.value);

    const uploadResourceType = ref<unknown | null>(null);

    const uploadActionDisabled = ref(true);

    const uploadResourceTypeOptions = ref([
      {
        label: "Employment Data Source",
        value: "EDS",
      },
      {
        label: "Sync Employment Hierarchies",
        value: "SEH",
      },
    ]);

    watch(
      () => uploadResourceType.value,
      (n, o) => {
        if (n === "EDS") uploadActionPath.value = backend.value;
        if (n === "SEH") uploadActionPath.value = "parent-" + backend.value;
        if (n === null) {
          uploadActionDisabled.value = true;
        } else {
          uploadActionDisabled.value = false;
        }

        console.log(uploadActionDisabled.value, n, uploadActionPath.value);
      }
    );

    onMounted(() => {
      console.log(uploadEmploymentComponentRefs.value);
    });

    watchDebounced(
      () => uploadEmploymentComponentRefs.value?.state.currentRowIndex,
      (n, o) => {
        datatableRefs.value?.reload();
      },
      { debounce: 1000, maxWait: 1000 }
    );

    return {
      columns: createEmploymentDatatableColumn(),
      backend,
      formData,
      showFormModal,
      openModal,
      closeModal,
      employmentFormRefs,
      employmentFromCardRefs,
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
      uploadEmploymentComponentRefs,
      uploadActionPath,
      uploadResourceType,
      uploadResourceTypeOptions,
      uploadActionDisabled,
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

        {JSON.stringify(this.uploadActionPath, null, 4)}

        <DatatableServerSide
          v-slots={{
            importer: () => (
              <div class={["flex flex-col w-full gap-x-3 mt-3"]}>
                <NSelect
                  options={this.uploadResourceTypeOptions}
                  v-model:value={this.uploadResourceType}
                  placeholder={
                    "Choose the type of upload action that you need to import into database"
                  }
                  clearable
                />
                <ExcelImporter
                  v-model:path={this.uploadActionPath}
                  ref="uploadEmploymentComponentRefs"
                  class={[""]}
                  label={""}
                  v-model:disableImport={this.uploadActionDisabled}
                />
              </div>
            ),
          }}
          ref="datatableRefs"
          path={backend}
          columns={columns}
          onTriggerUpdate={(id) => {
            (async () => {
              const { data } = await useApiService(`/${backend}/${id}`)
                .get()
                .json();

              setupUpdateAction(id, data, () => {
                formData.employmentHiringDate =
                  data.value.data.employment_hiring_date;
                formData.employmentEndDate =
                  data.value.data.employment_end_date;
                formData.employmentGroupTypeName =
                  data.value.data.employment_group_type_name;
                formData.employmentGroupAge =
                  data.value.data.employment_group_age;
                formData.employmentStatus = data.value.data.employment_status;
                formData.employmentPositionStatus =
                  data.value.data.employment_position_status;
                formData.employmentWsr = data.value.data.employment_wsr;
                formData.parentEmploymentId =
                  data.value.data.parent_employment_id;
                formData.profileId = data.value.data.profile_id;
                formData.positionId = data.value.data.position_id;
                formData.companyId = data.value.data.company_id;
                formData.directoratId = data.value.data.directorat_id;
                formData.personelAreaId = data.value.data.personel_area_id;
                formData.personelSubAreaId =
                  data.value.data.personel_sub_area_id;
                formData.plantAreaId = data.value.data.plant_area_id;
              });
            })();
          }}
        />

        <FormModal
          ref="employmentFormCardRefs"
          title={title}
          spin={showSpinner}
          v-model:show={showFormModal}
          onSubmit={formActionHandler}
          onCancel={() => {
            closeModal(), (formData.employmentHiringDate = null);
            formData.employmentEndDate = null;
            formData.employmentGroupTypeName = null;
            formData.employmentGroupAge = null;
            formData.employmentStatus = null;
            formData.employmentPositionStatus = null;
            formData.employmentWsr = null;
            formData.parentEmploymentId = null;
            formData.profileId = null;
            formData.positionId = null;
            formData.companyId = null;
            formData.directoratId = null;
            formData.personelAreaId = null;
            formData.personelSubAreaId = null;
            formData.plantAreaId = null;
          }}
        >
          <EmploymentForm
            ref="employmentFormRefs"
            v-model:method={formAction.method}
            v-model:employmentHiringDate={formData.employmentHiringDate}
            v-model:employmentEndDate={formData.employmentEndDate}
            v-model:employmentGroupTypeName={formData.employmentGroupTypeName}
            v-model:employmentGroupAge={formData.employmentGroupAge}
            v-model:employmentStatus={formData.employmentStatus}
            v-model:employmentPositionStatus={formData.employmentPositionStatus}
            v-model:employmentWsr={formData.employmentWsr}
            v-model:parentEmploymentId={formData.parentEmploymentId}
            v-model:profileId={formData.profileId}
            v-model:positionId={formData.positionId}
            v-model:companyId={formData.companyId}
            v-model:directoratId={formData.directoratId}
            v-model:personelAreaId={formData.personelAreaId}
            v-model:personelSubAreaId={formData.personelSubAreaId}
            v-model:plantAreaId={formData.plantAreaId}
          />
        </FormModal>
      </div>
    );
  },
});
