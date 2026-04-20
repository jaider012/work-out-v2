// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

/**
 * Add your icon mappings here. The key is a generic name we use across the app
 * (loosely matches Apple SF Symbols where possible) and the value is the
 * MaterialIcons name used as the fallback.
 *
 * - Material Icons: https://icons.expo.fyi
 * - SF Symbols: https://developer.apple.com/sf-symbols/
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.down': 'expand-more',
  'chevron.up': 'expand-less',
  'dumbbell': 'fitness-center',
  'list.bullet': 'list',
  'chart.line.uptrend.xyaxis': 'show-chart',
  'gearshape.fill': 'settings',
  'plus': 'add',
  'plus.circle.fill': 'add-circle',
  'minus': 'remove',
  'xmark': 'close',
  'checkmark': 'check',
  'checkmark.circle.fill': 'check-circle',
  'magnifyingglass': 'search',
  'person.fill': 'person',
  'person.crop.circle': 'account-circle',
  'calendar': 'calendar-today',
  'clock': 'access-time',
  'flame.fill': 'local-fire-department',
  'heart.fill': 'favorite',
  'bell.fill': 'notifications',
  'trash': 'delete-outline',
  'pencil': 'edit',
  'arrow.left': 'arrow-back',
  'arrow.right': 'arrow-forward',
  'square.and.pencil': 'create',
  'folder.fill': 'folder',
  'star.fill': 'star',
  'play.fill': 'play-arrow',
  'pause.fill': 'pause',
  'stop.fill': 'stop',
  'ellipsis': 'more-horiz',
  'ellipsis.circle': 'more-vert',
  'flag.fill': 'flag',
  'note.text': 'sticky-note-2',
  'arrow.up.arrow.down': 'swap-vert',
  'figure.strengthtraining.traditional': 'fitness-center',
  'questionmark.circle': 'help',
} satisfies Record<string, MaterialIconName>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that renders MaterialIcons across all platforms (consistent
 * look between iOS, Android and web).
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
