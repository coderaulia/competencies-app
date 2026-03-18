import { defineComponent, toRefs, computed, onMounted } from "vue";
import {
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NSwitch,
  type SelectOption,
} from "naive-ui";

export default defineComponent({
  name: "AssessmentScheduleForm",
  props: {
    method: {
      type: String,
      default: "",
      required: true,
    },
    assessmentScheduleTitle: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    assessmentSchedulDescription: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    assessmentScheduleYearPeriod: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    assessmentSchedulePhasePeriod: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    assessmentScheduleStartDate: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    assessmentScheduleEndDate: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    assessmentScheduleIsActive: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
  },
  emits: [
    "update:method",
    "update:assessmentScheduleTitle",
    "update:assessmentSchedulDescription",
    "update:assessmentScheduleYearPeriod",
    "update:assessmentSchedulePhasePeriod",
    "update:assessmentScheduleStartDate",
    "update:assessmentScheduleEndDate",
    "update:assessmentScheduleIsActive",
  ],
  setup(props, { emit, expose }) {
    const {
      method,
      assessmentScheduleTitle,
      assessmentSchedulDescription,
      assessmentScheduleYearPeriod,
      assessmentSchedulePhasePeriod,
      assessmentScheduleStartDate,
      assessmentScheduleEndDate,
      assessmentScheduleIsActive,
    } = toRefs(props);

    const method_ = computed({
      get: () => method.value,
      set: (value) => emit("update:method", value),
    });
    const assessmentScheduleTitle_ = computed({
      get: () => assessmentScheduleTitle.value,
      set: (value) => emit("update:assessmentScheduleTitle", value),
    });
    const assessmentSchedulDescription_ = computed({
      get: () => assessmentSchedulDescription.value,
      set: (value) => emit("update:assessmentSchedulDescription", value),
    });
    const assessmentScheduleYearPeriod_ = computed({
      get: () => assessmentScheduleYearPeriod.value,
      set: (value) => emit("update:assessmentScheduleYearPeriod", value),
    });
    const assessmentSchedulePhasePeriod_ = computed({
      get: () => assessmentSchedulePhasePeriod.value,
      set: (value) => emit("update:assessmentSchedulePhasePeriod", value),
    });
    const assessmentScheduleStartDate_ = computed({
      get: () => assessmentScheduleStartDate.value,
      set: (value) => emit("update:assessmentScheduleStartDate", value),
    });
    const assessmentScheduleEndDate_ = computed({
      get: () => assessmentScheduleEndDate.value,
      set: (value) => emit("update:assessmentScheduleEndDate", value),
    });
    const assessmentScheduleIsActive_ = computed({
      get: () => assessmentScheduleIsActive.value,
      set: (value) => emit("update:assessmentScheduleIsActive", value),
    });

    const generateYears = (range: number = 10) => {
      const years = [];
      const current = new Date().getFullYear();
      const max = current + range;

      for (let index = current; index < max; index++) {
        years.push(index);
      }

      return years;
    };

    const yearPeriodOptions = generateYears().map((item) => {
      return {
        label: String(item),
        value: String(item),
      };
    });

    const phasePeriodOptions = Array.from(["I", "II", "III", "IV"]).map(
      (item) => {
        return {
          label: `Kuartal Ke-${item}`,
          value: `Kuartal Ke-${item}`,
        };
      }
    );

    onMounted(() => {
      console.log(yearPeriodOptions);
    });

    return {
      method_,
      assessmentScheduleTitle_,
      assessmentSchedulDescription_,
      assessmentScheduleYearPeriod_,
      assessmentSchedulePhasePeriod_,
      assessmentScheduleStartDate_,
      assessmentScheduleEndDate_,
      assessmentScheduleIsActive_,
      yearPeriodOptions,
      phasePeriodOptions,
    };
  },
  render() {
    return (
      <div>
        <NForm>
          <NFormItem label="Assessment Title" labelPlacement="top">
            <NInput
              type="text"
              clearable
              v-model:value={this.assessmentScheduleTitle_}
              placeholder="Assessment Title"
              inputProps={{
                autocomplete: "off",
              }}
            />
          </NFormItem>
          <NFormItem label="Assessment Description" labelPlacement="top">
            <NInput
              type="text"
              clearable
              v-model:value={this.assessmentSchedulDescription_}
              placeholder="Assessment Description"
              inputProps={{
                autocomplete: "off",
              }}
            />
          </NFormItem>
          <NFormItem label="Assessment Year Period" labelPlacement="top">
            <NSelect
              ref="selectTrainingNotesOptionsRefs"
              clearable
              v-model:value={this.assessmentScheduleYearPeriod_}
              // @ts-ignore
              options={Array.from(this.yearPeriodOptions)}
              placeholder="Please select year period"
              onClear={() => {}}
            />
          </NFormItem>
          <NFormItem label="Assessment Phase Period" labelPlacement="top">
            <NSelect
              ref="selectTrainingNotesOptionsRefs"
              clearable
              v-model:value={this.assessmentSchedulePhasePeriod_}
              // @ts-ignore
              options={Array.from(this.phasePeriodOptions)}
              placeholder="Please select phase period"
              onClear={() => {}}
            />
          </NFormItem>
          <NFormItem label="Assessment Start Date" labelPlacement="top">
            <NDatePicker
              v-model:value={this.assessmentScheduleStartDate_}
              type="datetime"
              clearable
              class="flex w-full"
            />
          </NFormItem>
          <NFormItem label="Assessment End Date" labelPlacement="top">
            <NDatePicker
              v-model:value={this.assessmentScheduleEndDate_}
              type="datetime"
              clearable
              class="flex w-full"
            />
          </NFormItem>
          <NFormItem label="Auto Activate ?" labelPlacement="top">
            <NSwitch
              v-model:value={this.assessmentScheduleIsActive_}
              v-slots={{}}
              class=""
            />
          </NFormItem>
        </NForm>
      </div>
    );
  },
});
