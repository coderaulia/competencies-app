import useApiService from "@/composables/useApiService";
import {
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  type SelectOption,
} from "naive-ui";
import {
  defineComponent,
  computed,
  toRefs,
  inject,
  reactive,
  type Ref,
  ref,
  onMounted,
} from "vue";
import type { AvailableCompetencyOptions } from "./RequirementScoreForm";
export default defineComponent({
  name: "TrainingForm",
  props: {
    method: {
      type: String,
      default: "",
      required: true,
    },
    trainingJobCompetencyFunction: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    trainingJobCourseFunction: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    trainingTitle: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    trainingLevel: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    trainingTargetGroup: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    trainingNotes: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    trainingDeliveryMethod: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    trainingProgramDuration: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    trainingDayDuration: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    trainingHoursDuration: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    trainingObjective: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    trainingContent: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    trainingCompetencyLevelStackKey: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    competencyId: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
  },
  emits: [
    "update:method",
    "update:trainingJobCompetencyFunction",
    "update:trainingJobCourseFunction",
    "update:trainingTitle",
    "update:trainingLevel",
    "update:trainingTargetGroup",
    "update:trainingNotes",
    "update:trainingDeliveryMethod",
    "update:trainingProgramDuration",
    "update:trainingDayDuration",
    "update:trainingHoursDuration",
    "update:trainingObjective",
    "update:trainingContent",
    "update:trainingCompetencyLevelStackKey",
    "update:competencyId",
  ],
  setup(props, { emit, expose }) {
    const {
      method,
      trainingJobCompetencyFunction,
      trainingJobCourseFunction,
      trainingTitle,
      trainingLevel,
      trainingTargetGroup,
      trainingNotes,
      trainingDeliveryMethod,
      trainingProgramDuration,
      trainingDayDuration,
      trainingHoursDuration,
      trainingObjective,
      trainingContent,
      trainingCompetencyLevelStackKey,
      competencyId,
    } = toRefs(props);
    const method_ = computed({
      get: () => method.value,
      set: (value) => emit("update:method", value),
    });
    const trainingJobCompetencyFunction_ = computed({
      get: () => trainingJobCompetencyFunction.value,
      set: (value) => emit("update:trainingJobCompetencyFunction", value),
    });
    const trainingJobCourseFunction_ = computed({
      get: () => trainingJobCourseFunction.value,
      set: (value) => emit("update:trainingJobCourseFunction", value),
    });
    const trainingTitle_ = computed({
      get: () => trainingTitle.value,
      set: (value) => emit("update:trainingTitle", value),
    });
    const trainingLevel_ = computed({
      get: () => trainingLevel.value,
      set: (value) => emit("update:trainingLevel", value),
    });
    const trainingTargetGroup_ = computed({
      get: () => trainingTargetGroup.value,
      set: (value) => emit("update:trainingTargetGroup", value),
    });
    const trainingNotes_ = computed({
      get: () => trainingNotes.value,
      set: (value) => emit("update:trainingNotes", value),
    });
    const trainingDeliveryMethod_ = computed({
      get: () => trainingDeliveryMethod.value,
      set: (value) => emit("update:trainingDeliveryMethod", value),
    });
    const trainingProgramDuration_ = computed({
      get: () => trainingProgramDuration.value,
      set: (value) => emit("update:trainingProgramDuration", value),
    });
    const trainingDayDuration_ = computed({
      get: () => trainingDayDuration.value,
      set: (value) => emit("update:trainingDayDuration", value),
    });
    const trainingHoursDuration_ = computed({
      get: () => trainingHoursDuration.value,
      set: (value) => emit("update:trainingHoursDuration", value),
    });
    const trainingObjective_ = computed({
      get: () => trainingObjective.value,
      set: (value) => emit("update:trainingObjective", value),
    });
    const trainingContent_ = computed({
      get: () => trainingContent.value,
      set: (value) => emit("update:trainingContent", value),
    });
    const trainingCompetencyLevelStackKey_ = computed({
      get: () => trainingCompetencyLevelStackKey.value,
      set: (value) => emit("update:trainingCompetencyLevelStackKey", value),
    });
    const competencyId_ = computed({
      get: () => competencyId.value,
      set: (value) => emit("update:competencyId", value),
    });

    const trainingLevelOptions = reactive([
      {
        label: "Basic",
        value: "Basic",
      },
      {
        label: "Intermediate",
        value: "Intermediate",
      },
      {
        label: "Advance",
        value: "Advance",
      },
    ]);
    const trainingNotesOptions = reactive([
      {
        label: "Baru",
        value: "Baru",
      },
      {
        label: "Revisi",
        value: "Revisi",
      },
    ]);
    const trainingCompetencyLevelStackKeyOptions = reactive([
      {
        label: "1",
        value: 1,
      },
      {
        label: "2",
        value: 2,
      },
      {
        label: "3",
        value: 3,
      },
    ]);

    const competencyOptions: Ref<SelectOption[]> = ref([]);
    const initCompetencyOptions = async () => {
      const { data } = await useApiService(
        "/utilities/select_options/competencies"
      ).json();
      competencyOptions.value = (
        data.value.data as AvailableCompetencyOptions[]
      ).map((element) => {
        return {
          label: element?.competency_name,
          value: element?.id,
        };
      });
      // console.log(competencyOptions.value);
    };

    const loadingOptionsState = reactive({
      competencies: false,
      competencyLevel: false,
      positions: false,
    });

    const handleSearchCompetencies = (value: string) => {
      loadingOptionsState.competencies = true;

      if (!value.length) {
        window.setTimeout(() => {
          initCompetencyOptions();
          loadingOptionsState.competencies = false;
          return;
        }, 500);
      }
      window.setTimeout(() => {
        competencyOptions.value = competencyOptions.value.filter((item) => {
          if (item.label !== null) {
            // @ts-ignore
            return ~item.label.toLowerCase()?.indexOf(value.toLowerCase());
          } else {
            return ~item.label === null;
          }
        });
        loadingOptionsState.competencies = false;
      }, 500);
    };

    onMounted(() => initCompetencyOptions());

    return {
      method_,
      trainingJobCompetencyFunction_,
      trainingJobCourseFunction_,
      trainingTitle_,
      trainingLevel_,
      trainingTargetGroup_,
      trainingNotes_,
      trainingDeliveryMethod_,
      trainingProgramDuration_,
      trainingDayDuration_,
      trainingHoursDuration_,
      trainingObjective_,
      trainingContent_,
      trainingCompetencyLevelStackKey_,
      competencyId_,
      trainingLevelOptions,
      trainingNotesOptions,
      trainingCompetencyLevelStackKeyOptions,
      competencyOptions,
      loadingOptionsState,
      handleSearchCompetencies,
    };
  },
  render() {
    return (
      <div>
        <NForm ref="FormInstRefs">
          <NFormItem label="Job Competency Function" labelPlacement="top">
            <NInput
              type="text"
              clearable
              v-model:value={this.trainingJobCompetencyFunction_}
              placeholder="Job Competency Function"
              inputProps={{
                autocomplete: "off",
              }}
            />
          </NFormItem>
          <NFormItem label="Job Course Function" labelPlacement="top">
            <NInput
              type="text"
              clearable
              v-model:value={this.trainingJobCourseFunction_}
              placeholder="Job Course Function"
              inputProps={{
                autocomplete: "off",
              }}
            />
          </NFormItem>
          <NFormItem label="Select Training Level" labelPlacement="top">
            <NSelect
              ref="selectTrainingLevelOptionsRefs"
              clearable
              v-model:value={this.trainingLevel_}
              options={this.trainingLevelOptions}
              placeholder="Please select related entity"
              onClear={() => {}}
            />
          </NFormItem>
          <NFormItem label="Target Group" labelPlacement="top">
            <NInput
              type="text"
              clearable
              v-model:value={this.trainingTargetGroup_}
              placeholder="Job Course Function"
              inputProps={{
                autocomplete: "off",
              }}
            />
          </NFormItem>
          <NFormItem label="Select Training Notes" labelPlacement="top">
            <NSelect
              ref="selectTrainingNotesOptionsRefs"
              clearable
              v-model:value={this.trainingNotes_}
              options={this.trainingNotesOptions}
              placeholder="Please select related entity"
              onClear={() => {}}
            />
          </NFormItem>
          <NFormItem label="Delivery Method" labelPlacement="top">
            <NInput
              type="text"
              clearable
              v-model:value={this.trainingDeliveryMethod_}
              placeholder="Delivery Method"
              inputProps={{
                autocomplete: "off",
              }}
            />
          </NFormItem>
          <NFormItem label="Program Duration" labelPlacement="top">
            <NInputNumber
              class={["flex w-full"]}
              v-model:value={this.trainingProgramDuration_}
              placeholder="Program Duration"
              min={0}
            />
          </NFormItem>
          <NFormItem label="Day Duration" labelPlacement="top">
            <NInputNumber
              class={["flex w-full"]}
              v-model:value={this.trainingDayDuration_}
              placeholder="Day Duration"
              min={0}
            />
          </NFormItem>
          <NFormItem label="Hours Duration" labelPlacement="top">
            <NInputNumber
              class={["flex w-full"]}
              v-model:value={this.trainingHoursDuration_}
              placeholder="Hours Duration"
              min={0}
            />
          </NFormItem>
          <NFormItem label="Objective" labelPlacement="top">
            <NInput
              type="textarea"
              clearable
              v-model:value={this.trainingObjective_}
              placeholder="Training Objective"
              inputProps={{
                autocomplete: "off",
              }}
            />
          </NFormItem>
          <NFormItem label="Content" labelPlacement="top">
            <NInput
              type="textarea"
              clearable
              v-model:value={this.trainingContent_}
              placeholder="Training Content"
              inputProps={{
                autocomplete: "off",
              }}
            />
          </NFormItem>
          <NFormItem
            label="Select Competency Level Stack Key"
            labelPlacement="top"
          >
            <NSelect
              ref="selectTrainingLevelOptionsRefs"
              clearable
              v-model:value={this.trainingCompetencyLevelStackKey_}
              options={this.trainingCompetencyLevelStackKeyOptions}
              placeholder="Please select related entity"
              onClear={() => {}}
            />
          </NFormItem>
          <NFormItem label="Select Related Competency" labelPlacement="top">
            <NSelect
              ref="selectCompetenciesOptionsRefs"
              clearable
              filterable
              remote
              v-model:value={this.competencyId_}
              options={this.competencyOptions}
              loading={this.loadingOptionsState.competencies}
              onSearch={(query: string) => this.handleSearchCompetencies(query)}
              placeholder="Please select related entity"
              // disabled={this.method_ === "PATCH"}
              onClear={() => {}}
            />
          </NFormItem>
        </NForm>
      </div>
    );
  },
});
