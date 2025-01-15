import { SvgUri } from "react-native-svg";
import { createSinglePathSVG } from "./TEMPLATE";

export const Bell_Stroke2_Corner0_Rounded = createSinglePathSVG({
  path: "M15 3V5H13V6.04938C18.0533 6.5511 22 10.8147 22 16H2C2 10.8147 5.94668 6.5511 11 6.04938V5H9V3H15ZM23 20V18H1V20H23Z",
});

export const ServeIcon = () => {
  return (
    <SvgUri
      width="100%"
      height="100%"
      uri={require("../../../assets/icons/restaurant-waiter.svg")}
    />
  );
};
