import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav, Tab } from './src/components/BottomNav';
import { BrandDrop, NfcIcon } from './src/components/Icons';
import { NfcModal } from './src/components/NfcModal';
import { PressableScale } from './src/components/PressableScale';
import { SettingsModal } from './src/components/SettingsModal';
import { Toast, ToastState } from './src/components/Toast';
import { numberFormat } from './src/logic';
import { configureNotifications, syncNotifications } from './src/notifications';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { useWaterStore } from './src/store';
import { colors } from './src/theme';
import { Settings } from './src/types';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppShell />
    </SafeAreaProvider>
  );
}

function AppShell() {
  const insets = useSafeAreaInsets();
  const { state, addWater, undoLast, updateSettings, addDevice, touch } = useWaterStore();
  const [tab, setTab] = useState<Tab>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [nfcOpen, setNfcOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const slideX = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;

  const showToast = useCallback((message: string) => setToast({ message, id: Date.now() }), []);
  const hideToast = useCallback(() => setToast(null), []);

  // Permissão + canal de notificação na primeira abertura (e marca a visita atual).
  const configured = useRef(false);
  useEffect(() => {
    if (!state) return;
    if (!configured.current) {
      configured.current = true;
      configureNotifications().catch(() => {});
    }
    touch();
  }, [state, touch]);

  // Reagenda os lembretes sempre que o estado muda (registro, meta, última visita).
  useEffect(() => {
    if (state) syncNotifications(state);
  }, [state]);

  const changeTab = useCallback(
    (next: Tab) => {
      if (next === tab) {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        return;
      }
      const order: Record<Tab, number> = { home: 0, calendar: 1, profile: 2 };
      const direction = order[next] > order[tab] ? 1 : -1;
      slideX.setValue(direction * 34);
      fade.setValue(0.35);
      setTab(next);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      Animated.parallel([
        Animated.timing(slideX, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    },
    [tab, slideX, fade]
  );

  if (!state) {
    return (
      <View style={[styles.root, styles.loading]}>
        <Text style={styles.loadingBrand}>
          BEBA<Text style={styles.brandPlus}>+</Text>
        </Text>
        <Text style={styles.loadingText}>Carregando…</Text>
      </View>
    );
  }

  const handleAdd = (amount: number) => {
    addWater(amount);
    showToast(`+${numberFormat(amount)} ml`);
  };

  const handleSaveSettings = (next: Settings) => {
    updateSettings(next);
    setSettingsOpen(false);
    showToast('Meta atualizada.');
  };

  return (
    <View style={styles.root}>
      <View style={[styles.app, { paddingTop: insets.top + 16 }]}>
        <View style={styles.topbar}>
          <PressableScale
            style={styles.brand}
            onPress={() => changeTab('home')}
            activeScale={0.96}
            pressedOverlay={null}
            accessibilityRole="link"
            accessibilityLabel="BEBA+"
          >
            <BrandDrop size={29} />
            <Text style={styles.brandText}>
              BEBA<Text style={styles.brandPlus}>+</Text>
            </Text>
          </PressableScale>
          <PressableScale
            style={styles.iconButton}
            onPress={() => setNfcOpen(true)}
            activeScale={0.92}
            overlayRadius={16}
            accessibilityRole="button"
            accessibilityLabel="Conectar bebedouro por NFC"
          >
            <NfcIcon size={21} />
          </PressableScale>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 96 + insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{ opacity: fade, transform: [{ translateX: slideX }] }}
          >
            {tab === 'home' ? (
              <HomeScreen
                state={state}
                onAdd={handleAdd}
                onUndo={undoLast}
                onOpenSettings={() => setSettingsOpen(true)}
              />
            ) : null}
            {tab === 'calendar' ? <CalendarScreen state={state} /> : null}
            {tab === 'profile' ? <ProfileScreen state={state} onToast={showToast} /> : null}
          </Animated.View>
        </ScrollView>
      </View>

      <BottomNav active={tab} bottomInset={insets.bottom} onChange={changeTab} />
      <Toast toast={toast} bottomInset={insets.bottom} onHide={hideToast} />
      <SettingsModal
        visible={settingsOpen}
        settings={state.settings}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
      />
      <NfcModal
        visible={nfcOpen}
        devices={state.devices}
        onClose={() => setNfcOpen(false)}
        onConnect={addDevice}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  app: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 18,
  },
  topbar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  brandText: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: -1.3,
  },
  brandPlus: {
    color: colors.blue,
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingBrand: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.8,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 14,
  },
});
