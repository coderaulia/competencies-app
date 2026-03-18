import {
  NCollapse,
  NCollapseItem,
  NEmpty,
  type TreeOption,
  NCard,
} from "naive-ui";
import type { Key, ValueAtom } from "naive-ui/es/cascader/src/interface";
import { defineComponent, type PropType, toRefs } from "vue";
export type ShouldRendersOptions = {
  keys: Key[];
  options: (TreeOption | null)[];
};

export default defineComponent({
  name: "ChildDataTreeDynamicRenderer",
  props: {
    shouldRenders: {
      type: Object as PropType<ShouldRendersOptions>,
    },
  },
  setup(props) {
    const { shouldRenders } = toRefs(props);
    function renderNodeTree() {
      return shouldRenders?.value?.options
        .filter((option) => {
          return option?.root === true;
        })
        .map((optionFilter, index) => {
          const treeOptions = optionFilter;
          const childs = shouldRenders?.value?.options.filter(
            (child) => child?.parent === treeOptions?.key
          );
          return (
            <NCollapseItem
              title={treeOptions?.label + " DEPARTMENTS (paremeter lists)"}
              name={treeOptions?.key}
            >
              {childs?.length !== 0 ? (
                childs?.map((children) => {
                  return (
                    <NCollapseItem title={children?.label} name={children?.key}>
                      {
                        // @ts-ignore prevent errror when the children rendeerer is instance of string
                        children?.meta?.render(treeOptions?.rootId)
                      }
                    </NCollapseItem>
                  );
                })
              ) : (
                <NCard>
                  <NEmpty
                    description={`Belum ada ata dari sub  ${treeOptions?.label?.toLowerCase()} yang dipilih`}
                  />
                </NCard>
              )}
            </NCollapseItem>
          );
        });
    }
    return {
      renderNodeTree,
    };
  },
  render() {
    return (
      <div class={["flex w-full h-full"]}>
        <NCollapse>{this.renderNodeTree()}</NCollapse>
      </div>
    );
  },
});
