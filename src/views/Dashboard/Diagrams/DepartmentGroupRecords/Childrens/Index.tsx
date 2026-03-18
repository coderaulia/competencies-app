import {
  defineComponent,
  onBeforeMount,
  ref,
  h,
  computed,
  type ComputedRef,
} from "vue";
import { fetchData } from "@/composables/useApiService";
import {
  NSpace,
  NLayout,
  NLayoutSider,
  NLayoutContent,
  type TreeOption,
  NTree,
  NIcon,
  NCard,
  NEmpty,
  NInput,
} from "naive-ui";
import { rand } from "@vueuse/core";
import { Folder } from "@vicons/ionicons5";
import ChildDataRenderer from "./ChildDataRenderer";
import { createChild, createRoot, type ChildMeta } from "./component-tree";
import CompetentEmployee from "./Visualizations/CompetentEmployee";

export type SuccessResponse = {
  data: {
    [k: string]: unknown;
  }[];
  pagination: null;
  links: null;
};

export type DataRenderTree = {
  keys: (TreeOption | null)[];
  options: {
    node: TreeOption | null;
    action: "check" | "uncheck";
  };
  meta: never[];
};
export default defineComponent({
  name: "CompetentEmployeeesGraph",
  setup() {
    const treeData = ref<TreeOption[]>([]);
    const treeSearchPattern = ref<string>("");
    const treeDefaultExpandedKeys = ref<[]>([]);
    const treeDefaultCheckedKeys = ref<[]>([]);
    const treeSourceRefs = ref(null);
    const childTree = ref<ChildMeta[]>([
      {
        label: "CER (Competent Employee Ratio)",
        meta: {
          render: (departmentId: number) => (
            <CompetentEmployee departmentId={departmentId} />
          ),
          data: {},
        },
      },
      {
        label: "PBR (Position Based Ratio)",
        meta: {
          render: () => <div>lorem</div>,
          data: {},
        },
      },
      {
        label: "AVG (Percentage Average Ratio)",
        meta: {
          render: () => <div>lorem</div>,
          data: {},
        },
      },
    ]);

    async function makeTreeData(response: SuccessResponse) {
      return new Promise((resolve, reject) => {
        let start = performance.now();
        let end = 0;
        setTimeout(() => {
          const finalData = response.data.map((el, index) => {
            const level = index;
            const key =
              (el.department_name as unknown as string)
                .replaceAll(" ", "_")
                .toLowerCase() + `_${level}`;
            const childProps = {
              children: createChild(childTree.value, level, key),
            };
            return Object.assign(
              createRoot(el, index, el.department_id as number),
              childProps
            );
          });
          end = performance.now();
          resolve(finalData);
        }, end - start);
      });
    }

    async function initTreeData() {
      const fetch = await fetchData("GET", {
        path: "/utilities/analytics/competence_employe/by_department",
      });

      const { data, statusCode, error } = await fetch.json();

      if (statusCode.value === 200) {
        const response =
          typeof data.value === "string"
            ? (JSON.parse(data.value) as unknown as SuccessResponse)
            : (data.value as unknown as SuccessResponse);

        makeTreeData(response).then((value) => {
          treeData.value = [...(value as unknown as TreeOption[])];
        });
      }
    }

    const hanldeUpdateCheckedKeys = (data: DataRenderTree) => {
      const { keys, options, meta } = data;
      if (options.action === "check") {
      }

      if (options.action === "uncheck") {
      }
    };

    const shouldRenderViews = computed(() => {
      return (
        treeSourceRefs.value as unknown as InstanceType<typeof NTree>
      )?.getCheckedData();
    });

    onBeforeMount(async () => {
      await initTreeData();
    });

    return {
      treeData,
      treeSearchPattern,
      treeDefaultExpandedKeys,
      treeDefaultCheckedKeys,
      hanldeUpdateCheckedKeys,
      treeSourceRefs,
      shouldRenderViews,
    };
  },
  render() {
    const {
      treeData,
      treeSearchPattern,
      treeDefaultExpandedKeys,
      treeDefaultCheckedKeys,
      hanldeUpdateCheckedKeys,
      shouldRenderViews,
    } = this;
    return (
      <NCard bordered>
        <NSpace class={["relative h-[680px]"]}>
          <NLayout hasSider style="top: 0; bottom: 0" position="absolute">
            <NLayoutSider
              class={[""]}
              bordered
              collapseMode={"width"}
              collapsedWidth={250}
              width={500}
              showTrigger
              nativeScrollbar={false}
              contentStyle={{
                paddingTop: "24px",
                paddingRight: "24px",
              }}
            >
              <div class={["py-6 -mt-6"]}>
                Please checklist the data that did you want to visualize !
              </div>
              <div class={["py-6 -mt-6"]}>
                <NInput v-model:value={this.treeSearchPattern} />
              </div>
              <NTree
                ref="treeSourceRefs"
                checkable
                cascade
                multiple
                data={treeData}
                pattern={treeSearchPattern}
                showIrrelevantNodes={false}
                defaultExpandedKeys={treeDefaultExpandedKeys}
                defaultCheckedKeys={treeDefaultCheckedKeys}
                onUpdate:checkedKeys={(meta, keys, options) =>
                  hanldeUpdateCheckedKeys({ meta, keys, options })
                }
              />
            </NLayoutSider>
            <NLayoutContent
              nativeScrollbar={false}
              contentStyle={{
                padding: "24px",
              }}
              class={["flex flex-col w-full h-full"]}
            >
              <div class={["pb-6"]}>Already visualized resources !</div>
              <div>
                {shouldRenderViews?.keys.length !== 0 &&
                shouldRenderViews?.options.length !== 0 ? (
                  <ChildDataRenderer shouldRenders={shouldRenderViews} />
                ) : (
                  <NCard>
                    <NEmpty description="Belum ada data departemen yang di pilih" />
                  </NCard>
                )}
              </div>
            </NLayoutContent>
          </NLayout>
        </NSpace>
      </NCard>
    );
  },
});
