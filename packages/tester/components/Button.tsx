import React, {forwardRef} from 'react';
import {Text, TouchableHighlight, TouchableHighlightProps} from 'react-native';
import {PALETTE} from './palette';

interface ButtonProps extends TouchableHighlightProps {
  label: string;
  onPress: () => void;
}

export const Button = forwardRef<
  React.ElementRef<typeof TouchableHighlight>,
  ButtonProps
>(({label, onPress, ...rest}, ref) => {
  return (
    <TouchableHighlight
      ref={ref}
      underlayColor={PALETTE.REACT_CYAN_DARK}
      style={{
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: PALETTE.REACT_CYAN_LIGHT,
        borderWidth: 2,
        borderColor: PALETTE.REACT_CYAN_DARK,
      }}
      onPress={onPress}
      {...rest}>
      <Text style={{color: 'black', fontWeight: 'bold', fontSize: 12}}>
        {label}
      </Text>
    </TouchableHighlight>
  );
});

export default Button;
