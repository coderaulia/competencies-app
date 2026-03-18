import { defineComponent, inject, onMounted } from "vue";
import { NTag, NTable, NAlert } from "naive-ui";
import type { UserResource } from "@/models/User";
import { UserInjectionKey } from "@/layouts/Dashboard/Default";
import type { TrainingResource } from "@/models/Training";
export default defineComponent({
  name: "MyDataSelfassesssment_recordsIndex",
  setup() {
    const user = inject<UserResource>(UserInjectionKey);
    return {
      user,
    };
  },
  render() {
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
                          {this.user?.name}
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Email Address
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.email}
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Fullname
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.profile?.profile_fullname}
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Report to Email Address
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {
                            this.user?.profile?.employment?.parent?.profile
                              ?.user?.email
                          }
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Report to Fullname
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {
                            this.user?.profile?.employment?.parent?.profile
                              ?.profile_fullname
                          }
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
              {this.user?.profile?.employment?.assessment_records?.length !==
              0 ? (
                <NTable striped>
                  <thead>
                    <tr>
                      <th>Competency Name</th>
                      <th>Min. Requirement Score</th>
                      <th>Assessment Score</th>
                      <th>Score Gap</th>
                      <th>IDP Exposure & Experience</th>
                      <th>IDP Status</th>
                      <th>Selected Training</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.user?.profile?.employment?.position?.competency_by_level?.map(
                      (element, index) => (
                        <tr key={element.competency_name as string}>
                          <td>{element.competency_name}</td>
                          <td>
                            {element.minimum_score_by_level?.minimum_score}
                          </td>
                          <td>
                            {/* @ts-ignore */}
                            {this.user?.profile?.employment?.assessment_records[
                              index
                            ]?.assessment_score ?? (
                              <NTag class={[""]} type={"warning"}>
                                Data Belum Tersedia / Belum di isi
                              </NTag>
                            )}
                            {/* <NInputNumber min={0} max={formRecords[index].requiredScore} v-model:value={formRecords[index].value} /> */}
                          </td>
                          <td>
                            {/* @ts-ignore */}
                            {this.user?.profile?.employment?.assessment_records[
                              index
                            ]?.gap_score ?? (
                              <NTag class={[""]} type={"warning"}>
                                Data Belum Tersedia / Belum di isi
                              </NTag>
                            )}
                          </td>
                          <td>
                            {/* @ts-ignore */}
                            {this.user?.profile?.employment?.assessment_records[
                              index
                            ] !== undefined ? (
                              this.user?.profile?.employment
                                ?.assessment_records[index]
                                .idp_exposure_experience
                            ) : (
                              <NTag class={[""]} type={"warning"}>
                                Data Belum Tersedia / Belum di isi
                              </NTag>
                            )}
                          </td>
                          <td>
                            {/* @ts-ignore */}
                            {this.user?.profile?.employment?.assessment_records[
                              index
                            ] !== undefined ? (
                              this.user?.profile?.employment
                                ?.assessment_records[index].idp_status
                            ) : (
                              <NTag class={[""]} type={"warning"}>
                                Data Belum Tersedia / Belum di isi
                              </NTag>
                            )}
                          </td>
                          <td>
                            {/* @ts-ignore */}
                            {(this.user?.profile?.employment
                              ?.assessment_records[index] !==
                              undefined) &
                            (this.user?.profile?.employment?.assessment_records[
                              index
                            ].training_id !==
                              null) ? (
                              this.user?.profile?.employment?.position?.competency_by_level[
                                index
                              ]?.trainings.filter((e: TrainingResource) => {
                                // @ts-ignore
                                return (
                                  e.id ===
                                  this.user?.profile?.employment
                                    ?.assessment_records[index].training_id
                                );
                              })[0].training_title
                            ) : (
                              <NTag class={[""]} type={"warning"}>
                                Data Belum Tersedia / Belum di isi
                              </NTag>
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </NTable>
              ) : (
                <NAlert title="Warning" type={"warning"} showIcon>
                  <div class={["flex flex-row items-center justify-between"]}>
                    <div class={["w-1/2"]}>
                      Data assessment saat ini belum tersedia ! silahkan hubungi
                      supervisor anda untuk info lebih lanjut !
                    </div>
                  </div>
                </NAlert>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
