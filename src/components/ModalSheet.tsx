import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function ModalSheet({ visible, onClose, children }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
        >
          <ScrollView
            style={[styles.sheet, { maxHeight: height * 0.88 }]}
            contentContainerStyle={[styles.content, { paddingBottom: 20 + insets.bottom }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  keyboard: {
    width: '100%',
    maxWidth: 440,
  },
  sheet: {
    width: '100%',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#13232e',
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 35,
    shadowOffset: { width: 0, height: 20 },
    elevation: 20,
  },
  content: {
    paddingTop: 22,
    paddingHorizontal: 19,
  },
});
