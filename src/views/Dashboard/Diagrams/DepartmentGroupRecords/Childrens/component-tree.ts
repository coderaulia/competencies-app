import { h, type VNode } from "vue";
import { NIcon } from "naive-ui";
import { Folder } from "@vicons/ionicons5";
export type Childlabel = string;
export type ChildMeta = {
  [k: string]: (() => VNode) | (() => JSX.Element) | string | unknown;
};
export type Children = {
  level?: string;
  key?: string;
  parent?: string | number;
  label?: Childlabel;
  meta?: ChildMeta;
};
export function createRoot(
  elTarget: { [k: string]: unknown },
  index: number,
  rootId: number
) {
  const level = index;
  const key =
    (elTarget.department_name as unknown as string)
      .replaceAll(" ", "_")
      .toLowerCase() + `_${level}`;
  return {
    level,
    prefix: () =>
      h(NIcon, null, {
        default: () => h(Folder),
      }),
    key,
    label: elTarget.department_name as string,
    root: true,
    parent: null,
    rootId,
  };
}
export function createChild(
  childs: Children[] | [],
  level: number,
  key: string
): Children[] {
  return childs.map((child: Children, index) => {
    const { label, meta } = child;
    return {
      level: `_${level}` + `_${index}`,
      key: key + `_${level}` + `_${index}` + `_meta`,
      parent: key,
      label,
      meta,
    };
  });
}
