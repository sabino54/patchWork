import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
  Easing,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function BackgroundSwirl() {
  const progress1 = useSharedValue(0);
  const progress2 = useSharedValue(0);
  const progress3 = useSharedValue(0);

  useEffect(() => {
    const startAnimation = () => {
      progress1.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1, { duration: 4000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      progress2.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1, { duration: 4000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      progress3.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1, { duration: 4000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    };

    startAnimation();
  }, []);

  const path1Props = useAnimatedProps(() => {
    const y1 = 100 + progress1.value * 50;
    const y2 = 300 - progress1.value * 50;
    return {
      d: `M-50,200 C50,${y1} 150,${y2} 250,200 C350,${y1} 450,${y2} 550,200`,
    };
  });

  const path2Props = useAnimatedProps(() => {
    const y1 = 120 + progress2.value * 50;
    const y2 = 320 - progress2.value * 50;
    return {
      d: `M-30,220 C70,${y1} 170,${y2} 270,220 C370,${y1} 470,${y2} 570,220`,
    };
  });

  const path3Props = useAnimatedProps(() => {
    const y1 = 80 + progress3.value * 50;
    const y2 = 280 - progress3.value * 50;
    return {
      d: `M-70,180 C30,${y1} 130,${y2} 230,180 C330,${y1} 430,${y2} 530,180`,
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={width} height={height} style={styles.svg}>
        <AnimatedPath
          animatedProps={path1Props}
          stroke="#8d5fd3"
          strokeWidth="8"
          fill="none"
          opacity="0.4"
        />
        <AnimatedPath
          animatedProps={path2Props}
          stroke="#8d5fd3"
          strokeWidth="8"
          fill="none"
          opacity="0.3"
        />
        <AnimatedPath
          animatedProps={path3Props}
          stroke="#8d5fd3"
          strokeWidth="8"
          fill="none"
          opacity="0.3"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  svg: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -200 }],
  },
});
