import {
  NConfigProvider,
  NDialogProvider,
  NGlobalStyle,
  NLoadingBarProvider,
  NMessageProvider,
  NNotificationProvider,
} from "naive-ui";
import { defineComponent } from "vue";
import { RouterView } from "vue-router";

export default defineComponent({
  name: "Application",
  render() {
    return (
      <NConfigProvider>
        <NLoadingBarProvider>
          <NNotificationProvider>
            <NMessageProvider>
              <NDialogProvider>
                <NGlobalStyle />
                <RouterView />
              </NDialogProvider>
            </NMessageProvider>
          </NNotificationProvider>
        </NLoadingBarProvider>
      </NConfigProvider>
    );
  },
});
