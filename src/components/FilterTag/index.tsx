import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface FilterTagProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const FilterTag: React.FC<FilterTagProps> = ({ label, active, onClick }) => {
  return (
    <View
      className={classnames(styles.filterTag, active && styles.active)}
      onClick={onClick}
    >
      <Text>{label}</Text>
    </View>
  );
};

export default FilterTag;
