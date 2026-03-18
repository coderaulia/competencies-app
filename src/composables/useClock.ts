import { ref, onBeforeUnmount, reactive, computed } from "vue";

export const useCurrentTime = () => {
  const currentTime = ref(new Date());
  const updateCurrentTime = () => {
    currentTime.value = new Date();
  };
  const updateTimeInterval = setInterval(updateCurrentTime, 1000);
  onBeforeUnmount(() => {
    clearInterval(updateTimeInterval);
  });

  const makeUTCFormat = reactive({
    date: computed(() => currentTime.value.getUTCDate()),
    year: computed(() => currentTime.value.getUTCFullYear()),
    month: computed(() => currentTime.value.getUTCMonth()),
    day: computed(() => currentTime.value.getUTCDay()),
    hours: computed(() => currentTime.value.getUTCHours()),
    minutes: computed(() => currentTime.value.getUTCMinutes()),
    seconds: computed(() => currentTime.value.getUTCSeconds()),
    miliseconds: computed(() => currentTime.value.getUTCMilliseconds()),
  });
  const makeLocaleFormat = reactive({
    date: computed(() => currentTime.value.getDate()),
    year: computed(() => currentTime.value.getFullYear()),
    month: computed(() => currentTime.value.getMonth()),
    day: computed(() => currentTime.value.getDay()),
    hours: computed(() => currentTime.value.getHours()),
    minutes: computed(() => currentTime.value.getMinutes()),
    seconds: computed(() => currentTime.value.getSeconds()),
    miliseconds: computed(() => currentTime.value.getMilliseconds()),
    timezoneOffeset: computed(() => currentTime.value.getTimezoneOffset()),
  });

  return {
    currentTime,
    UTCFormat: makeUTCFormat,
    LocaleFormat: makeLocaleFormat,
  };
};
