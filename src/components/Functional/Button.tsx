import { defineComponent, toRef, computed } from "vue";

export const Button = defineComponent({
  name: "Button",
  props: {
    type: {
      type: String,
      required: true,
    },
  },
  emits: ["click"],
  setup(props, { slots, emit }) {
    // emit("click")
    const type = toRef(props, "type");
    // const theme = ref(["gray", "blue", "green", "yellow", "red", "indigo"]);
    const scheme = computed(() => {
      switch (type.value) {
        case "blue":
          return "blue";
          break;
        case "green":
          return "green";
          break;
        case "yellow":
          return "yellow";
          break;
        case "red":
          return "red";
          break;
        case "indigo":
          return "indigo";
          break;
        case "purple":
          return "purple";
          break;
        default:
          return "gray";
          break;
      }
    });

    const bgColor = computed(() => {
      switch (type.value) {
        case "blue":
          return "blue-600";
          break;
        case "green":
          return "green-600";
          break;
        case "yellow":
          return "yellow-600";
          break;
        case "red":
          return "red-600";
          break;
        case "indigo":
          return "indigo-600";
          break;
        case "purple":
          return "purple-600";
          break;
        default:
          return "white";
          break;
      }
    });

    const textColor = computed(() => {
      switch (type.value) {
        case "blue":
          return "white";
          break;
        case "green":
          return "white";
          break;
        case "yellow":
          return "white";
          break;
        case "red":
          return "white";
          break;
        case "indigo":
          return "white";
          break;
        case "purple":
          return "white";
          break;
        default:
          return "white";
          break;
      }
    });
    return {
      slots,
      type,
      scheme,
      bgColor,
      textColor,
      emit,
    };
  },
  render() {
    const { slots, scheme, emit, bgColor, textColor } = this;
    return (
      <button
        onClick={(payload: MouseEvent) => emit("click", payload)}
        class={[
          `file:mt-3 inline-flex w-full justify-center rounded-md border border-${scheme}-300 bg-${bgColor} px-4 py-2 text-base font-medium text-${textColor} shadow-sm hover:bg-${scheme}-50 focus:outline-none focus:ring-2 focus:ring-${scheme}-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`,
        ]}
      >
        {/* @ts-ignore */}
        {slots.default()}
      </button>
    );
  },
});
