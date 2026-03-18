import { NAvatar, NButton, type DataTableColumns } from "naive-ui";
import type { UserResource } from "@/models/User";
import {
  ColumnCreator,
  RenderTimeStampColumn,
  type BuildInDatatableKeys,
} from "./DatatableColumnCreator";
import { computed, defineComponent, onMounted, ref, toRefs } from "vue";
import useApiService from "@/composables/useApiService";

export type UserDatatable = UserResource & BuildInDatatableKeys;
export const createUserDataTableColumns = (): DataTableColumns<UserDatatable> =>
  ColumnCreator([
    {
      title: "AVATAR",
      key: "avatar",
      minWidth: 200,
      maxWidth: 300,
      render(rowData, rowIndex) {
        return <UserAvatar id={rowData.id as string} />;
      },
    },
    {
      title: "USERNAME",
      key: "name",
      minWidth: 200,
      maxWidth: 300,
    },
    {
      title: "EMAIL",
      key: "email",
      minWidth: 200,
      maxWidth: 300,
    },
    {
      title: "EMAIL VERIFIED AT",
      key: "email_verified_at",
      minWidth: 200,
      maxWidth: 300,
      render(rowData, rowIndex) {
        return <RenderTimeStampColumn date={rowData.updated_at as string} />;
      },
    },
  ]);

export const UserAvatar = defineComponent({
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },
  setup(props) {
    const { id } = toRefs(props);
    const defaultGravatarURL = ref(
      "https://www.gravatar.com/avatar/b1ee5260fbee69bd3d2426375772e741"
    );

    const getAvatarFromCurrentUserEmail = async () => {
      const { data, isFinished } = await useApiService("/gravatar/" + id.value);

      if (isFinished) {
        defaultGravatarURL.value = data.value as string;
      }
    };

    const avatar = computed(() => {
      return defaultGravatarURL.value.replace(".jpg?s=80&d=mp&r=g", "");
    });

    onMounted(() => {
      getAvatarFromCurrentUserEmail();
    });

    return {
      avatar,
    };
  },
  render() {
    const { avatar } = this;
    return (
      <NButton quaternary circle>
        <NAvatar round size={"medium"} src={avatar} />
      </NButton>
    );
  },
});
