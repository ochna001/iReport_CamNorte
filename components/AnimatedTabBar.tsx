import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { ClipboardList, Home, User2 } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

function getIcon(name: string) {
  switch (name) {
    case 'index':
      return Home;
    case 'reports':
      return ClipboardList;
    case 'profile':
      return User2;
    default:
      return Home;
  }
}

function getLabel(
  routeKey: string,
  title?: string | undefined,
  label?: string | number | ((props: any) => React.ReactNode)
) {
  if (typeof label === 'string' || typeof label === 'number') return String(label);
  if (title) return title;
  return routeKey;
}

export default function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [containerWidth, setContainerWidth] = useState(0);
  const itemCount = state.routes.length;
  const itemWidth = containerWidth > 0 && itemCount > 0 ? containerWidth / itemCount : 0;

  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const toX = (itemWidth || 0) * state.index;
    Animated.spring(translateX, {
      toValue: toX,
      useNativeDriver: true,
      damping: 16,
      stiffness: 360,
      mass: 0.5,
    }).start();
  }, [state.index, itemWidth]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setContainerWidth(w);
  };

  const routes = state.routes;

  const shadowStyle = useMemo(
    () => ({
      shadowColor: 'transparent',
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
      elevation: 0,
    }),
    []
  );

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}> 
      <View style={[styles.outer, shadowStyle]} onLayout={onLayout}>
        {itemWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pill,
              {
                width: Math.max(itemWidth, 56),
                transform: [{ translateX }],
                backgroundColor: Colors.white,
              },
            ]}
          />
        )}

        {routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label = getLabel(route.name, options.title as string | undefined, options.tabBarLabel);
          const Icon = getIcon(route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[styles.item, { width: itemWidth || undefined }]}
            >
              <View style={styles.itemContent}>
                <Icon
                  size={22}
                  color={isFocused ? Colors.primary : Colors.text.secondary}
                  strokeWidth={2.5}
                />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.label,
                    {
                      color: isFocused ? Colors.primary : Colors.text.secondary,
                    },
                  ]}
                >
                  {label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.background,
    width: '100%',
  },
  outer: {
    marginHorizontal: 12,
    backgroundColor: 'transparent',
    borderRadius: 32,
    height: 68,
    paddingVertical: 6,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  pill: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    borderRadius: 999,
  },
  item: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
