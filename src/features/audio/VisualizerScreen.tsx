import React, { useEffect, useMemo } from 'react';
import { View, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence, 
  Easing,
  withDelay
} from 'react-native-reanimated';

interface Props {
  isPlaying: boolean;
  title: string;
}

const NUM_BARS = 48;

const VisualizerBar = React.memo(({ index, isPlaying, numBars }: { index: number, isPlaying: boolean, numBars: number }) => {
  const barValue = useSharedValue(10);
  
  useEffect(() => {
    if (isPlaying) {
      const randomDuration = 300 + Math.random() * 400;
      const randomHeight = 20 + Math.random() * 80;
      
      barValue.value = withDelay(
        index * 30, // cascade effect
        withRepeat(
          withSequence(
            withTiming(randomHeight, { duration: randomDuration, easing: Easing.inOut(Easing.ease) }),
            withTiming(10, { duration: randomDuration, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      );
    } else {
      barValue.value = withTiming(10, { duration: 300 });
    }
  }, [isPlaying, index, barValue]);

  const barStyle = useAnimatedStyle(() => ({
    height: barValue.value,
  }));

  const angle = (index * 360) / numBars;

  return (
    <Animated.View
      className="absolute w-[4px] bg-blue-400 rounded-full"
      style={[
        {
          transform: [
            { rotate: `${angle}deg` },
            { translateY: -100 } // push outward from center
          ]
        },
        barStyle
      ]}
    />
  );
});

export const VisualizerScreen = ({ isPlaying, title }: Props) => {
  const centerPulse = useSharedValue(1);

  useEffect(() => {
    if (isPlaying) {
      centerPulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      centerPulse.value = withTiming(1, { duration: 300 });
    }
  }, [isPlaying, centerPulse]);

  const centerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: centerPulse.value }],
  }));

  const barIndices = useMemo(() => Array.from({ length: NUM_BARS }).map((_, i) => i), []);

  return (
    <View className="flex-1 justify-center items-center px-[30px] pt-[20px] pb-[80px]">
      <Text className="text-white text-xl font-bold mb-10 tracking-widest uppercase text-center absolute top-[20px]">Visualizer</Text>
      
      <View className="items-center justify-center mb-16">
        
        <Animated.View 
          className="w-[150px] h-[150px] rounded-full bg-blue-500/20 items-center justify-center absolute"
          style={centerStyle}
        >
          <View className="w-[100px] h-[100px] rounded-full bg-blue-500/40 items-center justify-center">
            <View className="w-[60px] h-[60px] rounded-full bg-blue-500 shadow-lg shadow-blue-500" />
          </View>
        </Animated.View>

        <View className="w-[250px] h-[250px] items-center justify-center">
          {barIndices.map((i) => (
            <VisualizerBar key={i} index={i} isPlaying={isPlaying} numBars={NUM_BARS} />
          ))}
        </View>
      </View>

      <Text className="text-blue-400 text-sm font-semibold tracking-widest mt-12 text-center">
        {isPlaying ? 'SYNCING TO AUDIO...' : 'PAUSED'}
      </Text>
      <Text className="text-slate-500 text-xs text-center mt-2" numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
};
