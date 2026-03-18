import WebViewer from "@pdftron/webviewer";
import { defineComponent, onMounted, ref, toRef, watch } from "vue";

function normalizeUrl(basePath: string, path: string) {
  return `${basePath.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function resolveDocumentUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const storageBasepath = String(
    import.meta.env.VITE_AWS_S3_BUCKET_OBJECT_BASEPATH ?? ""
  ).trim();

  if (!storageBasepath) {
    return "";
  }

  return normalizeUrl(storageBasepath, path);
}

export default defineComponent({
  name: "PDFTronReader",
  props: {
    path: String,
  },
  setup(props) {
    const PDFReaderRefs = ref<HTMLElement | null>(null);
    const documentPath = toRef(props, "path");

    const mountViewer = async (nextPath: string) => {
      if (!PDFReaderRefs.value) {
        return;
      }

      const documentUrl = resolveDocumentUrl(nextPath);
      if (!documentUrl) {
        return;
      }

      PDFReaderRefs.value.innerHTML = "";

      const instance = await WebViewer(
        {
          path: "/webviewer",
          licenseKey:
            "demo:1691871296609:7c54bbfd030000000080ad064b9772e2a5cedc0c3abb0320b2bd2eaaf7",
          initialDoc: documentUrl,
          extension: "pdf",
        },
        PDFReaderRefs.value
      );

      instance.UI.setTheme("dark");
    };

    onMounted(() => {
      watch(
        documentPath,
        (nextPath) => {
          if (nextPath) {
            void mountViewer(nextPath);
          }
        },
        { immediate: true }
      );
    });

    return {
      PDFReaderRefs,
    };
  },
  render() {
    return <div ref="PDFReaderRefs" class={["h-[100vh]"]} />;
  },
});
