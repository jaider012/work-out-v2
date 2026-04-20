import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleProp, TextInput, TextInputProps, TextStyle } from 'react-native';

import { fromKg, toKg, WeightUnit } from '@/contexts/SettingsContext';
import { formatDisplay, parseBuffer } from '@/utils/numericInputBuffer';

type BaseProps = {
  placeholder?: string;
  placeholderTextColor?: string;
  style?: StyleProp<TextStyle>;
  testID?: string;
  returnKeyType?: TextInputProps['returnKeyType'];
};

type WeightProps = BaseProps & {
  mode: 'weight';
  valueKg: number;
  weightUnit: WeightUnit;
  onCommitKg: (kg: number) => void;
};

type RepsProps = BaseProps & {
  mode: 'reps';
  value: number;
  onCommit: (value: number) => void;
};

export type NumericSetInputProps = WeightProps | RepsProps;

export function NumericSetInput(props: NumericSetInputProps) {
  const { mode, placeholder, placeholderTextColor, style, testID, returnKeyType } = props;

  const externalDisplay =
    mode === 'weight'
      ? formatDisplay(props.valueKg ? fromKg(props.valueKg, props.weightUnit) : 0, 'weight')
      : formatDisplay(props.value, 'reps');

  const [buffer, setBuffer] = useState(externalDisplay);
  const lastCommittedRef = useRef(externalDisplay);

  useEffect(() => {
    if (externalDisplay === lastCommittedRef.current) return;
    lastCommittedRef.current = externalDisplay;
    setBuffer(externalDisplay);
  }, [externalDisplay]);

  const pushParsed = useCallback(
    (text: string) => {
      const parsed = parseBuffer(text, mode);
      if (mode === 'weight') {
        const kg = parsed > 0 ? toKg(parsed, props.weightUnit) : 0;
        lastCommittedRef.current = formatDisplay(
          kg ? fromKg(kg, props.weightUnit) : 0,
          'weight',
        );
        props.onCommitKg(kg);
      } else {
        const reps = parsed > 0 ? Math.round(parsed) : 0;
        lastCommittedRef.current = formatDisplay(reps, 'reps');
        props.onCommit(reps);
      }
    },
    [mode, props],
  );

  const handleChange = useCallback(
    (text: string) => {
      setBuffer(text);
      pushParsed(text);
    },
    [pushParsed],
  );

  const commit = useCallback(() => {
    pushParsed(buffer);
    setBuffer(lastCommittedRef.current);
  }, [buffer, pushParsed]);

  return (
    <TextInput
      testID={testID}
      value={buffer}
      onChangeText={handleChange}
      onBlur={commit}
      onEndEditing={commit}
      keyboardType={mode === 'weight' ? 'decimal-pad' : 'number-pad'}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      style={style}
      returnKeyType={returnKeyType}
    />
  );
}
