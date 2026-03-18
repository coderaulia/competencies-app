import useApiService from "@/composables/useApiService";
import type { EmploymentResource } from "@/models/Employment";
import type { TrainingResource } from "@/models/Training";
import {
  c,
  NCollapse,
  NCollapseItem,
  NEmpty,
  NSpace,
  NTable,
  NTag,
} from "naive-ui";
import { LinkEdit20Regular } from "@vicons/fluent";
import {
  defineComponent,
  onMounted,
  toRefs,
  type PropType,
  ref,
  watch,
} from "vue";
import { useRoute } from "vue-router";
import FormModal from "@/components/Modal/FormModal";
import DetailModal from "@/components/Modal/DetailModal";
import AssessmentForm from "./AssessmentForm";

export default defineComponent({
  name: "EmploymentRecordsAssessmentDetail",
  props: {
    data: {
      type: Object as PropType<EmploymentResource>,
      default: null,
    },
  },
  setup(props) {
    const { data } = toRefs(props);
    const showModal = ref(false);
    const showSpinner = ref(false);
    const onButtonClicked = (
      e: Event | MouseEvent,
      id: number | string | null = null
    ) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      showModal.value = !showModal.value;
      console.log(id);
    };
    const onCloseButtonClicked = (
      e: Event | MouseEvent,
      id: number | string | null = null
    ) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      showModal.value = !showModal.value;
    };
    const onCancel = (e: Event | MouseEvent) => {};
    const onSubmit = (e: Event | MouseEvent) => {};
    return {
      data,
      showModal,
      showSpinner,
      onButtonClicked,
      onCloseButtonClicked,
      onCancel,
      onSubmit,
    };
  },
  render() {
    const {} = this;
    return (
      <div>
        <div class={["flex flex-col"]}>
          <div class="md:grid md:grid-cols-3 md:gap-6 p-2">
            <div class="mt-5 md:col-span-3 md:mt-0">
              <div class="overflow-hidden shadow sm:rounded-md">
                <div class="overflow-hidden bg-white shadow sm:rounded-lg">
                  <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg font-medium leading-6 text-green-900">
                      Employee Assesment Records
                    </h3>
                    <p class="mt-1 max-w-2xl text-sm text-green-500">
                      Assessment Score and Reporting detail
                    </p>
                  </div>
                  <div class="border-t border-green-200">
                    <dl>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Username
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.data?.profile?.user?.name}
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Email Address
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.data?.profile?.user?.email}
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Fullname
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.data?.profile?.profile_fullname}
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Report to Email Address
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.data?.parent?.profile?.user?.email}
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Report to Fullname
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.data?.parent?.profile?.profile_fullname}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class={["flex flex-col"]}>
          <div class={["md:grid md:grid-cols-3 md:gap-6 p-2"]}>
            <div class={["md:col-span-12"]}>
              {this.data?.appliedAssessmentLogs?.length ? (
                <NCollapse>
                  {this.data?.appliedAssessmentLogs.map((item, index) => (
                    <NCollapseItem
                      title={
                        `Hystorycal Assements Logs Info : ${item.assessment_schedule_title} - ${item.assessment_schedule_year_period} - ${item.assessment_schedule_phase_period}` as string
                      }
                    >
                      <NTable striped>
                        <thead>
                          <tr>
                            <th>Competency Name</th>
                            <th>Min. Requirement Score</th>
                            <th>Assessment Score</th>
                            <th>Score Gap</th>
                            {/* <th>IDP Status</th> */}
                            <th>Selected Recommended Training</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.data?.position?.competency_by_level?.map(
                            (element, index) => {
                              // @ts-ignore
                              const assessments =
                                this.data?.assessmentRecords?.filter(
                                  (el) =>
                                    el?.assessment_schedule_id === item?.id
                                );
                              return (
                                <tr key={element.competency_name as string}>
                                  <td>{element.competency_name}</td>
                                  <td>
                                    {
                                      element.minimum_score_by_level
                                        ?.minimum_score
                                    }
                                  </td>
                                  {/* @ts-ignore */}
                                  <td>{assessments[index].assessment_score}</td>
                                  <td>
                                    {/* @ts-ignore */}
                                    {assessments[index]?.gap_score ?? (
                                      <NTag class={[""]} type={"warning"}>
                                        Data Belum Tersedia / Belum di isi
                                      </NTag>
                                    )}
                                  </td>
                                  {/* @ts-ignore */}
                                  {/* <td>
                                    {assessments[index] !== undefined ? assessments[index].idp_status :  (
                                      <NTag class={[""]} type={"warning"}>
                                        Data Belum Tersedia / Belum di isi
                                      </NTag>
                                    )}
                                  </td> */}
                                  <td>
                                    {/* @ts-ignore */}
                                    {(assessments[index] !== undefined) &
                                    (assessments[index].training_id !==
                                      null) ? (
                                      this.data?.position?.competency_by_level[
                                        index
                                      ]?.trainings.filter(
                                        (e: TrainingResource) => {
                                          // @ts-ignore
                                          return (
                                            e.id ===
                                            assessments[index].training_id
                                          );
                                        }
                                      )[0].training_title
                                    ) : (
                                      <NTag class={[""]} type={"warning"}>
                                        Data Belum Tersedia / Belum di isi
                                      </NTag>
                                    )}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </NTable>

                      <NTable striped class={["w-full mt-2"]}>
                        <thead>
                          <tr>
                            <th></th>
                            <th>Individual Development Plan (IDP)</th>
                            <th>IDP Status (Please Select)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            // @ts-ignore
                            (this.data?.periodicalGeneralAssessments as [])
                              .filter(
                                (e) => e.assessment_schedule_id === item.id
                              )
                              .map((e) => {
                                return (
                                  <tr>
                                    {/* @ts-ignore */}
                                    <td class={"w-64"}>{e.parameters_name}</td>
                                    {/* @ts-ignore */}
                                    <td class={"w-64"}>{e.parameters_value}</td>
                                    {/* @ts-ignore */}
                                    <td class={"w-64"}>{e.status}</td>
                                  </tr>
                                );
                              })
                          }
                        </tbody>
                      </NTable>
                    </NCollapseItem>
                  ))}
                </NCollapse>
              ) : (
                <NEmpty
                  description="No Assessment Record Founds here !"
                  class={["mt-4"]}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
