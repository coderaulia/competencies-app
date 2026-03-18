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
  ref,
  type Ref,
  onMounted,
  reactive,
  watch,
} from "vue";
export type AvailableCompetencyOptions = {
  id: number;
  competency_name: string;
};
export type AvailableCompetencyLevelOptions = {
  id: number;
  competency_level_name: string;
};
export type AvailablePositionOptions = {
  id: number;
  position_name: string;
};
export default defineComponent({
  name: "RequirementScoreForm",
  props: {
    method: {
      type: [String],
      default: "",
      required: true,
    },
    minimumScore: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    competencyId: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    competencyLevelId: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    positionId: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
  },
  emits: [
    "update:method",
    "update:minimumScore",
    "update:competencyId",
    "update:competencyLevelId",
    "update:positionId",
  ],
  setup(props, { emit, expose }) {
    const {
      method,
      minimumScore,
      competencyId,
      competencyLevelId,
      positionId,
    } = toRefs(props);

    const method_ = computed({
      get: () => method.value,
      set: (value) => emit("update:method", value),
    });

    const minimumScore_ = computed({
      get: () => minimumScore.value,
      set: (value) => emit("update:minimumScore", value),
    });
    const competencyId_ = computed({
      get: () => competencyId.value,
      set: (value) => emit("update:competencyId", value),
    });
    const competencyLevelId_ = computed({
      get: () => competencyLevelId.value,
      set: (value) => emit("update:competencyLevelId", value),
    });
    const positionId_ = computed({
      get: () => positionId.value,
      set: (value) => emit("update:positionId", value),
    });

    const competencyOptions: Ref<SelectOption[]> = ref([]);
    const competencyLevelOptions: Ref<SelectOption[]> = ref([]);
    const positionOptions: Ref<SelectOption[]> = ref([]);
    // const loadingOptionsState: Ref<boolean> = ref(false);

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
      console.log(competencyOptions.value);
    };
    const initCompetencyLevelOptions = async () => {
      const { data } = await useApiService(
        "/utilities/select_options/competency_levels"
      ).json();
      competencyLevelOptions.value = (
        data.value.data as AvailableCompetencyLevelOptions[]
      ).map((element) => {
        return {
          label: element?.competency_level_name,
          value: element?.id,
        };
      });
      console.log(competencyLevelOptions.value);
    };

    const initPositionOptions = async () => {
      const { data } = await useApiService(
        "/utilities/select_options/positions"
      ).json();
      positionOptions.value = (
        data.value.data as AvailablePositionOptions[]
      ).map((element) => {
        return {
          label: element?.position_name,
          value: element?.id,
        };
      });
      console.log(positionOptions.value);
    };

    const initAllSelectOptionsMetadata = () => {
      initCompetencyOptions();
      initCompetencyLevelOptions();
      initPositionOptions();
    };

    onMounted(() => {
      initAllSelectOptionsMetadata();
    });

    const loadingOptionsState = reactive({
      competencies: false,
      competencyLevel: false,
      positions: false,
    });

    const selectCompetenciesRefs = ref<HTMLElement | null>(null);
    const selectCompetencyLevelsOptionsRefs = ref<HTMLElement | null>(null);
    const selectPoisitionsRefs = ref<HTMLElement | null>(null);

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

    // watch(() =>)

    const handleSearchCompetencyLevels = (value: string) => {
      loadingOptionsState.competencyLevel = true;

      if (!value.length) {
        window.setTimeout(() => {
          initCompetencyLevelOptions();
          loadingOptionsState.competencyLevel = false;
          return;
        }, 500);
      }
      window.setTimeout(() => {
        competencyLevelOptions.value = competencyOptions.value.filter(
          (item) => {
            if (item.label !== null) {
              // @ts-ignore
              return ~item.label.toLowerCase()?.indexOf(value.toLowerCase());
            } else {
              return ~item.label === null;
            }
          }
        );
        loadingOptionsState.competencyLevel = false;
      }, 500);
    };

    const handleSearchPositions = (value: string) => {
      loadingOptionsState.positions = true;

      if (!value.length) {
        window.setTimeout(() => {
          initPositionOptions();
          loadingOptionsState.positions = true;
          return;
        }, 500);
      }
      window.setTimeout(() => {
        positionOptions.value = positionOptions.value.filter((item) => {
          if (item.label !== null) {
            // @ts-ignore
            return ~item.label.toLowerCase()?.indexOf(value.toLowerCase());
          } else {
            return ~item.label === null;
          }
        });
        loadingOptionsState.positions = false;
      }, 500);
    };

    return {
      method_,
      minimumScore_,
      competencyId_,
      competencyLevelId_,
      positionId_,
      competencyOptions,
      competencyLevelOptions,
      positionOptions,
      loadingOptionsState,
      handleSearchCompetencies,
      handleSearchCompetencyLevels,
      handleSearchPositions,
      selectCompetenciesRefs,
      selectCompetencyLevelsOptionsRefs,
      selectPoisitionsRefs,
    };
  },
  render() {
    const {
      loadingOptionsState,
      handleSearchCompetencies,
      handleSearchCompetencyLevels,
      handleSearchPositions,
    } = this;

    return (
      <div>
        <NForm ref="FormInstRefs">
          <NFormItem label="Minimum Score" labelPlacement="top">
            <NInputNumber
              class={["w-full"]}
              clearable
              min={0}
              v-model:value={this.minimumScore_}
              placeholder="Please input minimum score gap"
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
              loading={loadingOptionsState.competencies}
              onSearch={(query: string) => handleSearchCompetencies(query)}
              placeholder="Please select related entity"
              // disabled={this.method_ === "PATCH"}
              onClear={() => {}}
            />
          </NFormItem>
          <NFormItem
            label="Select Related Competency Level"
            labelPlacement="top"
          >
            <NSelect
              ref="selectCompetencyLevelsOptionsRefs"
              clearable
              filterable
              remote
              v-model:value={this.competencyLevelId_}
              options={this.competencyLevelOptions}
              loading={loadingOptionsState.competencyLevel}
              onSearch={(query: string) => handleSearchCompetencyLevels(query)}
              placeholder="Please select related entity"
              // disabled={this.method_ === "PATCH"}
            />
          </NFormItem>
          <NFormItem label="Select Related Position" labelPlacement="top">
            <NSelect
              ref="selectPositionsOptionsRefs"
              clearable
              filterable
              remote
              v-model:value={this.positionId_}
              options={this.positionOptions}
              loading={loadingOptionsState.positions}
              onSearch={(query: string) => handleSearchPositions(query)}
              placeholder="Please select related entity"
              // disabled={this.method_ === "PATCH"}
            />
          </NFormItem>
        </NForm>
      </div>
    );
  },
});
