import useApiService from "@/composables/useApiService";
import type { CompanyResource } from "@/models/Company";
import type { DirectoratResource } from "@/models/Directorat";
import type { EmploymentResource } from "@/models/Employment";
import type { PersonelAreaResource } from "@/models/PersonelArea";
import type { PersonelSubAreaResource } from "@/models/PersonelSubArea";
import type { PlantAreaResource } from "@/models/PlantArea";
import type { PositionResource } from "@/models/Position";
import type { ProfileResource } from "@/models/Profile";
import {
  NForm,
  NFormItem,
  NSelect,
  NInput,
  type SelectOption,
  NDatePicker,
} from "naive-ui";
import {
  defineComponent,
  toRefs,
  computed,
  ref,
  type Ref,
  onMounted,
  reactive,
} from "vue";
import type { AvailableCompetencyOptions } from "./RequirementScoreForm";
export type AvailableParentEmploymentOptions = Partial<EmploymentResource> & {
  id: number;
};
export type AvailableProfileOptions = Partial<ProfileResource> & {
  id: number;
};
export type AvailablePositionOptions = Partial<PositionResource> & {
  id: number;
};
export type AvailableCompanyOptions = Partial<CompanyResource> & {
  id: number;
};
export type AvailableDirectoratOptions = Partial<DirectoratResource> & {
  id: number;
};
export type AvailablePersonelAreaOptions = Partial<PersonelAreaResource> & {
  id: number;
};
export type AvailablePersonelSubAreaOptions =
  Partial<PersonelSubAreaResource> & {
    id: number;
  };
export type AvailablePlantAreaOptions = Partial<PlantAreaResource> & {
  id: number;
};
export default defineComponent({
  name: "EmploymentForm",
  props: {
    method: {
      type: [String, Number, Boolean],
      default: "",
      required: true,
    },
    employmentHiringDate: {
      type: [String, Number, Boolean],
      default: null,
      required: false,
    },
    employmentEndDate: {
      type: [String, Number, Boolean],
      default: null,
      required: false,
    },
    employmentGroupTypeName: {
      type: [String, Number, Boolean],
      default: null,
      required: false,
    },
    employmentGroupAge: {
      type: [String, Number, Boolean],
      default: null,
      required: false,
    },
    employmentStatus: {
      type: [String, Number, Boolean],
      default: null,
      required: false,
    },
    employmentPositionStatus: {
      type: [String, Number, Boolean],
      default: null,
      required: false,
    },
    employmentWsr: {
      type: [String, Number, Boolean],
      default: null,
      required: false,
    },
    parentEmploymentId: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    profileId: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    positionId: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    companyId: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    directoratId: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    personelAreaId: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    personelSubAreaId: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
    plantAreaId: {
      type: [Number, String, Boolean],
      default: null,
      required: false,
    },
  },
  emits: [
    "update:method",
    "update:employmentHiringDate",
    "update:employmentEndDate",
    "update:employmentGroupTypeName",
    "update:employmentGroupAge",
    "update:employmentStatus",
    "update:employmentPositionStatus",
    "update:employmentWsr",
    "update:parentEmploymentId",
    "update:profileId",
    "update:positionId",
    "update:companyId",
    "update:directoratId",
    "update:personelAreaId",
    "update:personelSubAreaId",
    "update:plantAreaId",
  ],
  setup(props, { emit, expose }) {
    const {
      method,
      employmentHiringDate,
      employmentEndDate,
      employmentGroupTypeName,
      employmentGroupAge,
      employmentStatus,
      employmentPositionStatus,
      employmentWsr,
      parentEmploymentId,
      profileId,
      positionId,
      companyId,
      directoratId,
      personelAreaId,
      personelSubAreaId,
      plantAreaId,
    } = toRefs(props);

    const method_ = computed({
      get: () => method.value,
      set: (value) => emit("update:method", value),
    });

    const employmentHiringDate_ = computed({
      get: () =>
        employmentHiringDate.value
          ? new Date(employmentHiringDate.value as string).getTime()
          : null,
      set: (value) => emit("update:employmentHiringDate", value),
    });
    const employmentEndDate_ = computed({
      get: () =>
        employmentEndDate.value
          ? new Date(employmentEndDate.value as string).getTime()
          : null,
      set: (value) => emit("update:employmentEndDate", value),
    });
    const employmentGroupTypeName_ = computed({
      get: () => employmentGroupTypeName.value,
      set: (value) => emit("update:employmentGroupTypeName", value),
    });
    const employmentGroupAge_ = computed({
      get: () => employmentGroupAge.value,
      set: (value) => emit("update:employmentGroupAge", value),
    });
    const employmentStatus_ = computed({
      get: () => employmentStatus.value,
      set: (value) => emit("update:employmentStatus", value),
    });
    const employmentPositionStatus_ = computed({
      get: () => employmentPositionStatus.value,
      set: (value) => emit("update:employmentPositionStatus", value),
    });
    const employmentWsr_ = computed({
      get: () => employmentWsr.value,
      set: (value) => emit("update:employmentWsr", value),
    });
    const parentEmploymentId_ = computed({
      get: () => parentEmploymentId.value,
      set: (value) => emit("update:parentEmploymentId", value),
    });
    const profileId_ = computed({
      get: () => profileId.value,
      set: (value) => emit("update:profileId", value),
    });
    const positionId_ = computed({
      get: () => positionId.value,
      set: (value) => emit("update:positionId", value),
    });
    const companyId_ = computed({
      get: () => companyId.value,
      set: (value) => emit("update:companyId", value),
    });
    const directoratId_ = computed({
      get: () => directoratId.value,
      set: (value) => emit("update:directoratId", value),
    });
    const personelAreaId_ = computed({
      get: () => personelAreaId.value,
      set: (value) => emit("update:personelAreaId", value),
    });
    const personelSubAreaId_ = computed({
      get: () => personelSubAreaId.value,
      set: (value) => emit("update:personelSubAreaId", value),
    });
    const plantAreaId_ = computed({
      get: () => plantAreaId.value,
      set: (value) => emit("update:plantAreaId", value),
    });

    const parentEmploymentOptions: Ref<SelectOption[]> = ref([]);
    const profileOptions: Ref<SelectOption[]> = ref([]);
    const positionOptions: Ref<SelectOption[]> = ref([]);
    const companyOptions: Ref<SelectOption[]> = ref([]);
    const directoratOptions: Ref<SelectOption[]> = ref([]);
    const personelAreaOptions: Ref<SelectOption[]> = ref([]);
    const personelSubAreaOptions: Ref<SelectOption[]> = ref([]);
    const plantAreaOptions: Ref<SelectOption[]> = ref([]);

    const loadingIndicator = ref<boolean>(false);

    const initParentEmploymentOptions = async () => {
      const { data } = await useApiService(
        "/utilities/select_options/employments"
      ).json();
      // @ts-ignore
      parentEmploymentOptions.value = (
        data.value.data as AvailableParentEmploymentOptions[]
      ).map((element) => {
        return {
          label: element?.profile?.profile_fullname,
          value: element.id,
        };
      });
    };
    const initProfileOptions = async () => {
      const { data } = await useApiService(
        "/utilities/select_options/profiles"
      ).json();
      // @ts-ignore
      profileOptions.value = (data.value.data as AvailableProfileOptions[]).map(
        (element) => {
          return {
            label: element.profile_fullname,
            value: element.id,
          };
        }
      );
    };
    const initPositionOptions = async () => {
      const { data } = await useApiService(
        "/utilities/select_options/positions"
      ).json();
      // @ts-ignore
      positionOptions.value = (
        data.value.data as AvailablePositionOptions[]
      ).map((element) => {
        return {
          label: element.position_name,
          value: element.id,
        };
      });
    };
    const initCompanyOptions = async () => {
      const { data } = await useApiService(
        "/utilities/select_options/companies"
      ).json();
      // console.log(data.value.data)
      /// @ts-ignore
      companyOptions.value = (data.value.data as AvailableCompanyOptions[]).map(
        (element) => {
          return {
            label: element.company_name,
            value: element.id,
          };
        }
      );
    };
    const initDirectoratOptions = async () => {
      const { data } = await useApiService(
        "/utilities/select_options/directorats"
      ).json();
      // console.log(data.value.data)
      // @ts-ignore
      directoratOptions.value = (
        data.value.data as AvailableDirectoratOptions[]
      ).map((element) => {
        return {
          label: element.directorat_name,
          value: element.id,
        };
      });
    };
    const initPersonelAreaOptions = async () => {
      const { data } = await useApiService(
        "/utilities/select_options/personel_areas"
      ).json();
      // console.log(data.value.data)
      // @ts-ignore
      personelAreaOptions.value = (
        data.value.data as AvailablePersonelAreaOptions[]
      ).map((element) => {
        return {
          label: element.personel_area_text,
          value: element.id,
        };
      });
    };
    const initPersonelSubAreaOptions = async () => {
      const { data } = await useApiService(
        "/utilities/select_options/personel_sub_areas"
      ).json();
      // console.log(data.value.data)
      // @ts-ignore
      personelSubAreaOptions.value = (
        data.value.data as AvailablePersonelSubAreaOptions[]
      ).map((element) => {
        return {
          label: element.personel_sub_area_text,
          value: element.id,
        };
      });
    };
    const initPlantAreaOptions = async () => {
      const { data } = await useApiService(
        "/utilities/select_options/plant_areas"
      ).json();
      // console.log(data.value.data)
      // @ts-ignore
      plantAreaOptions.value = (
        data.value.data as AvailablePlantAreaOptions[]
      ).map((element) => {
        return {
          label: element.plant_area_name,
          value: element.id,
        };
      });
    };

    const initAllSelectOptionsMetadata = async () => {
      initParentEmploymentOptions();
      initProfileOptions();
      initPositionOptions();
      initCompanyOptions();
      initDirectoratOptions();
      initPersonelAreaOptions();
      initPersonelSubAreaOptions();
      initPlantAreaOptions();
    };

    const loadingIndicatorOptions = reactive({
      profile: false,
      parentProfile: false,
      position: false,
      personelArea: false,
      personelSubArea: false,
    });

    const handleSearchProfile = (value: string) => {
      loadingIndicatorOptions.profile = true;

      if (!value.length) {
        window.setTimeout(() => {
          initProfileOptions();
          loadingIndicatorOptions.profile = true;
          return;
        }, 500);
      }
      window.setTimeout(() => {
        profileOptions.value = profileOptions.value.filter((item) => {
          if (item.label !== null) {
            // @ts-ignore
            return ~item.label.toLowerCase()?.indexOf(value.toLowerCase());
          } else {
            return ~item.label === null;
          }
        });
        loadingIndicatorOptions.profile = false;
      }, 500);
    };

    const handleSearchParentProfile = (value: string) => {
      loadingIndicatorOptions.parentProfile = true;

      if (!value.length) {
        window.setTimeout(() => {
          initParentEmploymentOptions();
          loadingIndicatorOptions.parentProfile = true;
          return;
        }, 500);
      }
      window.setTimeout(() => {
        parentEmploymentOptions.value = parentEmploymentOptions.value.filter(
          (item) => {
            if (item.label !== null) {
              // @ts-ignore
              return ~item.label.toLowerCase()?.indexOf(value.toLowerCase());
            } else {
              return ~item.label === null;
            }
          }
        );
        loadingIndicatorOptions.parentProfile = false;
      }, 500);
    };

    const handleSearchPosition = (value: string) => {
      loadingIndicatorOptions.position = true;

      if (!value.length) {
        window.setTimeout(() => {
          initPositionOptions();
          loadingIndicatorOptions.position = true;
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
        loadingIndicatorOptions.position = false;
      }, 500);
    };

    const handleSearchPersonelArea = (value: string) => {
      loadingIndicatorOptions.personelArea = true;

      if (!value.length) {
        window.setTimeout(() => {
          initPersonelAreaOptions();
          loadingIndicatorOptions.personelArea = true;
          return;
        }, 500);
      }
      window.setTimeout(() => {
        personelAreaOptions.value = personelAreaOptions.value.filter((item) => {
          if (item.label !== null) {
            // @ts-ignore
            return ~item.label.toLowerCase()?.indexOf(value.toLowerCase());
          } else {
            return ~item.label === null;
          }
        });
        loadingIndicatorOptions.personelArea = false;
      }, 500);
    };

    const handleSearchPersonelSubArea = (value: string) => {
      loadingIndicatorOptions.personelSubArea = true;

      if (!value.length) {
        window.setTimeout(() => {
          initPersonelSubAreaOptions();
          loadingIndicatorOptions.personelSubArea = true;
          return;
        }, 500);
      }
      window.setTimeout(() => {
        personelSubAreaOptions.value = personelSubAreaOptions.value.filter(
          (item) => {
            if (item.label !== null) {
              // @ts-ignore
              return ~item.label.toLowerCase()?.indexOf(value.toLowerCase());
            } else {
              return ~item.label === null;
            }
          }
        );
        loadingIndicatorOptions.personelSubArea = false;
      }, 500);
    };

    onMounted(() => {
      initAllSelectOptionsMetadata();
    });

    return {
      method_,
      employmentHiringDate_,
      employmentEndDate_,
      employmentGroupTypeName_,
      employmentGroupAge_,
      employmentStatus_,
      employmentPositionStatus_,
      employmentWsr_,
      parentEmploymentId_,
      profileId_,
      positionId_,
      companyId_,
      directoratId_,
      personelAreaId_,
      personelSubAreaId_,
      plantAreaId_,
      parentEmploymentOptions,
      profileOptions,
      positionOptions,
      companyOptions,
      directoratOptions,
      personelAreaOptions,
      personelSubAreaOptions,
      plantAreaOptions,
      loadingIndicator,
      loadingIndicatorOptions,
      handleSearchProfile,
      handleSearchParentProfile,
      handleSearchPosition,
      handleSearchPersonelArea,
      handleSearchPersonelSubArea,
    };
  },
  render() {
    // const hiringDateUnix = computed()

    return (
      <NForm ref="FormInstRefs">
        <NFormItem label="Pick Hiring Date" labelPlacement="top">
          <NDatePicker
            type="datetime"
            clearable
            class={["w-full"]}
            v-model:value={this.employmentHiringDate_}
          />
        </NFormItem>
        <NFormItem label="Pick Ending Date" labelPlacement="top">
          <NDatePicker
            type="datetime"
            clearable
            class={["w-full"]}
            v-model:value={this.employmentEndDate_}
          />
        </NFormItem>
        <NFormItem label="Group Type Name" labelPlacement="top">
          <NInput
            type="text"
            clearable
            placeholder={"Input Group Type Name"}
            v-model:value={this.employmentGroupTypeName_}
            inputProps={{
              autocomplete: "off",
            }}
          />
        </NFormItem>
        <NFormItem label="Age Group" labelPlacement="top">
          <NInput
            type="text"
            clearable
            placeholder={"Input Age Group"}
            v-model:value={this.employmentGroupAge_}
            inputProps={{
              autocomplete: "off",
            }}
          />
        </NFormItem>
        <NFormItem label="Employment Status" labelPlacement="top">
          <NInput
            type="text"
            clearable
            placeholder={"Input Employment Status"}
            v-model:value={this.employmentStatus_}
            inputProps={{
              autocomplete: "off",
            }}
          />
        </NFormItem>
        <NFormItem label="Employment Position Status" labelPlacement="top">
          <NInput
            type="text"
            clearable
            placeholder={"Input Employment Position Status"}
            v-model:value={this.employmentPositionStatus_}
            inputProps={{
              autocomplete: "off",
            }}
          />
        </NFormItem>
        <NFormItem label="WSR" labelPlacement="top">
          <NInput
            type="text"
            clearable
            placeholder={"Input Employment WSR"}
            v-model:value={this.employmentWsr_}
            inputProps={{
              autocomplete: "off",
            }}
          />
        </NFormItem>
        <NFormItem label="Select Profile" labelPlacement="top">
          <NSelect
            clearable
            filterable
            remote
            v-model:value={this.profileId_}
            options={this.profileOptions}
            loading={this.loadingIndicatorOptions.profile}
            onSearch={(value) => this.handleSearchProfile(value)}
          ></NSelect>
        </NFormItem>
        <NFormItem
          label="Select Parent Employment Profile"
          labelPlacement="top"
        >
          <NSelect
            clearable
            filterable
            remote
            v-model:value={this.parentEmploymentId_}
            options={this.parentEmploymentOptions}
            loading={this.loadingIndicatorOptions.parentProfile}
            onSearch={(value) => this.handleSearchParentProfile(value)}
          ></NSelect>
        </NFormItem>
        <NFormItem label="Select Position" labelPlacement="top">
          <NSelect
            clearable
            filterable
            remote
            v-model:value={this.positionId_}
            options={this.positionOptions}
            loading={this.loadingIndicatorOptions.position}
            onSearch={(value) => this.handleSearchPosition(value)}
          ></NSelect>
        </NFormItem>
        <NFormItem label="Select Company" labelPlacement="top">
          <NSelect
            clearable
            filterable
            remote
            v-model:value={this.companyId_}
            options={this.companyOptions}
            loading={this.loadingIndicator}
          ></NSelect>
        </NFormItem>
        <NFormItem label="Select Directorat" labelPlacement="top">
          <NSelect
            clearable
            filterable
            remote
            v-model:value={this.directoratId_}
            options={this.directoratOptions}
            loading={this.loadingIndicator}
          ></NSelect>
        </NFormItem>
        <NFormItem label="Select Personel Area" labelPlacement="top">
          <NSelect
            clearable
            filterable
            remote
            v-model:value={this.personelAreaId_}
            options={this.personelAreaOptions}
            loading={this.loadingIndicatorOptions.personelArea}
            onSearch={(value) => this.handleSearchPersonelArea(value)}
          ></NSelect>
        </NFormItem>
        <NFormItem label="Select Personel Sub Area" labelPlacement="top">
          <NSelect
            clearable
            filterable
            remote
            v-model:value={this.personelSubAreaId_}
            options={this.personelSubAreaOptions}
            loading={this.loadingIndicatorOptions.personelSubArea}
            onSearch={(value) => this.handleSearchPersonelSubArea(value)}
          ></NSelect>
        </NFormItem>
        <NFormItem label="Select Plant Area" labelPlacement="top">
          <NSelect
            clearable
            filterable
            remote
            v-model:value={this.plantAreaId_}
            options={this.plantAreaOptions}
            loading={this.loadingIndicator}
          ></NSelect>
        </NFormItem>
      </NForm>
    );
  },
});
