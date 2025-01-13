import Reactotron, {
  trackGlobalErrors,
  networking,
  openInEditor,
} from "reactotron-react-native";

// Reactotron.clear();
Reactotron.configure({
  name: "kitchen",
  host: "localhost",
})
  .useReactNative()
  .use(networking())
  .use(openInEditor())
  .use(trackGlobalErrors())
  .connect();
