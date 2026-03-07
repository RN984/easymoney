import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, Palette } from '../constants/theme';

const APP_VERSION = '1.0.0';

export const HamburgerMenu = () => {
  const [visible, setVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const router = useRouter();

  const handleNavigate = (path: Href) => {
    setVisible(false);
    router.push(path);
  };

  const handleOpenAbout = () => {
    setVisible(false);
    setAboutVisible(true);
  };

  return (
    <>
      <Pressable style={styles.button} onPress={() => setVisible(true)}>
        <Ionicons name="menu" size={28} color={Colors.light.primary} />
      </Pressable>

      {/* メインメニュー */}
      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.menuContainer}>
            <Text style={styles.title}>EasyMoney</Text>

            <Pressable style={styles.menuItem} onPress={() => handleNavigate('/settings')}>
              <Ionicons name="settings-outline" size={24} color={Colors.light.primary} />
              <Text style={styles.menuText}>設定</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={handleOpenAbout}>
              <Ionicons name="information-circle-outline" size={24} color={Colors.light.primary} />
              <Text style={styles.menuText}>アプリについて</Text>
            </Pressable>

            <Pressable style={styles.closeButton} onPress={() => setVisible(false)}>
              <Text style={styles.closeText}>閉じる</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* アプリについてモーダル */}
      <Modal visible={aboutVisible} transparent animationType="slide">
        <View style={styles.aboutOverlay}>
          <View style={styles.aboutContainer}>
            <View style={styles.aboutHeader}>
              <Text style={styles.aboutTitle}>EasyMoney</Text>
              <Pressable onPress={() => setAboutVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.aboutContent}>
              <View style={styles.aboutIconWrapper}>
                <Ionicons name="wallet-outline" size={64} color={Colors.light.primary} />
              </View>

              <Text style={styles.aboutVersion}>バージョン {APP_VERSION}</Text>

              <Text style={styles.aboutDescription}>
                EasyMoneyは、コインをタップするだけで簡単に支出を記録できる家計簿アプリです。
              </Text>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>主な機能</Text>
                <Text style={styles.aboutFeature}>・コインタップで素早く支出記録</Text>
                <Text style={styles.aboutFeature}>・カテゴリ別の支出管理</Text>
                <Text style={styles.aboutFeature}>・月別の収支レポート</Text>
                <Text style={styles.aboutFeature}>・CSVエクスポート</Text>
                <Text style={styles.aboutFeature}>・位置情報の記録</Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>お問い合わせ</Text>
                <Pressable onPress={() => Linking.openURL('mailto:support@easymoney.app')}>
                  <Text style={styles.aboutLink}>support@easymoney.app</Text>
                </Pressable>
              </View>

              <Text style={styles.aboutCopyright}>
                &copy; 2026 EasyMoney. All rights reserved.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
  },
  menuContainer: {
    width: '70%',
    height: '100%',
    backgroundColor: Colors.light.background,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    color: Colors.light.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 16,
    color: Colors.light.primary,
  },
  closeButton: {
    marginTop: 'auto',
    padding: 16,
    alignItems: 'center',
  },
  closeText: {
    color: Colors.light.secondary,
  },
  // About モーダル
  aboutOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutContainer: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: Palette.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  aboutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  aboutContent: {
    padding: 24,
  },
  aboutIconWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  aboutVersion: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.light.gray,
    marginBottom: 20,
  },
  aboutDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.light.text,
    marginBottom: 24,
  },
  aboutSection: {
    marginBottom: 20,
  },
  aboutSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.gray,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  aboutFeature: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.text,
  },
  aboutLink: {
    fontSize: 14,
    color: Colors.light.primary,
    textDecorationLine: 'underline',
  },
  aboutCopyright: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.light.gray,
    marginTop: 24,
    marginBottom: 8,
  },
});