import type { AvailablePositionOptions } from "@/components/Forms/EmploymentForm";
import FormModal from "@/components/Modal/FormModal";
import useBasicNotification from "@/composables/notifications/useBasicNotification";
import useApiService from "@/composables/useApiService";
import type { EmploymentResource } from "@/models/Employment";
import {
  NAlert,
  NCard,
  NFormItem,
  NModal,
  NSelect,
  NSpin,
  NTabPane,
  NTabs,
  NTag,
} from "naive-ui";
import {
  defineComponent,
  inject,
  onMounted,
  ref,
  watch,
  computed,
  reactive,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import AssessmentDetail from "./Assessment/AssessmentDetail";
import AssessmentForm from "./Assessment/AssessmentForm";
import AssessmentRecord from "./Assessment/AssessmentRecord";

export default defineComponent({
  name: "EmploymentRecordsCertificationAssessment",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const id = ref<string | string[] | null>(null);
    const employmentResource = ref<EmploymentResource | null>(null);

    const employmentDetail = computed(() => {
      return employmentResource.value;
    });

    const initEmploymentOnMount = async () => {
      const { data, isFinished, statusCode } = await useApiService(
        `/employments/${route.params.id}`
      )
        .get()
        .json();
      if (statusCode.value === 200) {
        employmentResource.value = data.value.data;
      }
    };

    initEmploymentOnMount();

    watch(() => route.params.id, () => undefined);

    const showAddPositionModal = ref<boolean>(false);
    const showAddPositionSpinner = ref<boolean>(false);
    const availablePositions = ref<[]>([]);
    const selectedPosition = ref<number | null>(0);
    const pickedPosition = computed({
      get: () => selectedPosition.value,
      set: (value) => (selectedPosition.value = value),
    });

    const openAddPositionModal = () => {
      pickedPosition.value = null;
      selectedPosition.value = null;
      showAddPositionModal.value = true;
    };
    const closeAddPositionModal = () => {
      pickedPosition.value = null;
      selectedPosition.value = null;
      showAddPositionModal.value = false;
    };

    const initPositionOptions = async () => {
      const { data } = await useApiService(
        "/utilities/select_options/positions"
      ).json();
      // @ts-ignore
      availablePositions.value = (
        data.value.data as AvailablePositionOptions[]
      ).map((element) => {
        return {
          label: element.position_name,
          value: element.id,
        };
      });
    };

    const showSpinner = ref<boolean>(false);

    const formAddPositionRequest = reactive({
      positionId: computed(() => pickedPosition.value),
    });

    const notification = useBasicNotification();

    const handleAssociatePositionToEmployee = async () => {
      // console.log({
      //   formAddPositionRequest,
      //   employmentDetail
      // })

      showSpinner.value = true;

      const {
        data,
        isFinished,
        statusCode,
        error,
        // @ts-ignore
      } = await useApiService(
        "/transactions/assessment_record/add_position/" +
          computed(() => employmentDetail?.value?.id).value
      )
        .post(formAddPositionRequest)
        .json();

      if (isFinished.value) {
        showSpinner.value = false;
      }

      if (statusCode.value === 200) {
        notification.notify("success", "SUCCESS", "Success Saved", "");
        closeAddPositionModal();
        initEmploymentOnMount();
      }

      if (statusCode.value === 422) {
        notification.notify(
          "error",
          "Error " + statusCode.value,
          "Error occured",
          (error.value as string).toString()
        );
      }

      if (statusCode.value === 404) {
        notification.notify(
          "error",
          "Error " + statusCode.value,
          "Error occured",
          (error.value as string).toString()
        );
      }

      if (statusCode.value === 500) {
        notification.notify(
          "error",
          "Error " + statusCode.value,
          "Error occured",
          (error.value as string).toString()
        );
      }
    };

    const selectOptionLoadingIndicator = ref<boolean>(false);

    const handleSearchPosition = (value: string) => {
      selectOptionLoadingIndicator.value = true;

      if (!value.length) {
        window.setTimeout(() => {
          initPositionOptions();
          selectOptionLoadingIndicator.value = true;
          return;
        }, 500);
      }
      window.setTimeout(() => {
        // @ts-ignore
        availablePositions.value = availablePositions.value.filter((item) => {
          // @ts-ignore
          if (item.label !== null) {
            // @ts-ignore
            return ~item.label.toLowerCase()?.indexOf(value.toLowerCase());
          } else {
            // @ts-ignore
            return ~item.label === null;
          }
        });
        selectOptionLoadingIndicator.value = false;
      }, 500);
    };

    const parentComponent = ref(null);
    return {
      employmentResource,
      employmentDetail,
      showAddPositionModal,
      showAddPositionSpinner,
      availablePositions,
      initPositionOptions,
      initEmploymentOnMount,
      openAddPositionModal,
      closeAddPositionModal,
      selectedPosition,
      pickedPosition,
      notification,
      showSpinner,
      formAddPositionRequest,
      handleAssociatePositionToEmployee,
      handleSearchPosition,
      selectOptionLoadingIndicator,
    };
  },
  render() {
    const {
      employmentResource,
      employmentDetail,
      showAddPositionModal,
      showAddPositionSpinner,
      availablePositions,
      initPositionOptions,
      initEmploymentOnMount,
      openAddPositionModal,
      closeAddPositionModal,
      selectedPosition,
      pickedPosition,
      notification,
      showSpinner,
      formAddPositionRequest,
      handleAssociatePositionToEmployee,
    } = this;

    return (
      <div class={["flex flex-col px-6"]}>
        <NCard>
          <NTabs type="line" animated defaultValue={"AssessmentDetail"}>
            <NTabPane
              name={"AssessmentDetail"}
              tab={"Assessment Report & Histories"}
            >
              <AssessmentDetail
                v-model:data={employmentDetail as EmploymentResource}
              />
              {/* {employmentDetail?.assessmentRecords?.length !== 0 ? (
              ) : (
                <NAlert title="Warning" type={"warning"} showIcon>
                  <div class={["flex flex-row items-center justify-between"]}>
                    <div class={["w-1/2"]}>
                      Data assessment saat ini belum tersedia ! silahkan buka
                      tab Form Assessment untuk menambah data !
                    </div>
                  </div>
                </NAlert>
              )} */}
            </NTabPane>
            <NTabPane name={"AssessmentForm"} tab={"Form Assessment"}>
              {employmentDetail?.position !== null ? (
                <AssessmentForm
                  v-model:data={employmentDetail as EmploymentResource}
                  onSubmit={() => {
                    initEmploymentOnMount();
                  }}
                />
              ) : (
                <NAlert title="Warning" type={"warning"} showIcon>
                  <div class={["flex flex-row items-center justify-between"]}>
                    <div class={["w-1/2"]}>
                      Data Posisi Untuk Karyawan Terpilih Belum Tersedia Saat
                      Ini
                    </div>
                    <div class={["w-1/2 flex flex-row justify-end"]}>
                      <button
                        onClick={() => {
                          openAddPositionModal();
                          initPositionOptions();
                        }}
                        class={[
                          "inline-flex justify-center rounded-md border border-transparent bg-yellow-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-600 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm -ml-2",
                        ]}
                      >
                        Tambahkan Posisi ?
                      </button>
                    </div>
                  </div>
                  <FormModal
                    title="Add position to selected employye"
                    v-model:show={showAddPositionModal}
                    spin={showAddPositionSpinner}
                    onSubmit={() => {
                      handleAssociatePositionToEmployee();
                      initEmploymentOnMount();
                    }}
                    onCancel={() => {
                      closeAddPositionModal();
                    }}
                  >
                    <NSpin show={showSpinner}>
                      <div class={["text-black"]}>
                        <NFormItem label="Select Position" labelPlacement="top">
                          <NSelect
                            clearable
                            filterable
                            remote
                            loading={this.selectOptionLoadingIndicator}
                            v-model:value={this.pickedPosition}
                            options={availablePositions}
                            onSearch={(value) =>
                              this.handleSearchPosition(value)
                            }
                          />
                        </NFormItem>
                      </div>
                    </NSpin>
                  </FormModal>
                </NAlert>
              )}
            </NTabPane>
            <NTabPane
              name={"Certification"}
              tab={"Form Mandatory Certification"}
            >
              To Be Developed In phase 2
            </NTabPane>
          </NTabs>
        </NCard>
      </div>
    );
  },
});
