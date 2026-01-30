// src/components/HumburgerMenu.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { Colors, Palette } from '../../constants/theme';

export const HamburgerMenu = () => {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  const toggleMenu = () => setVisible(!visible);

  const navigateTo = (path: '/history' | '/' | '/debug-test') => {
    setVisible(false);
    router.push(path);
  };

  return (
    <>
      {/* メニューボタン */}
      <TouchableOpacity 
        style={styles.container} 
        onPress={toggleMenu}
        activeOpacity={0.7}
      >
        <Text style={styles.icon}>≡</Text>
      </TouchableOpacity>

      {/* メニューモーダル */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={toggleMenu}
      >
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuContent}>
                <Text style={styles.menuHeader}>Menu</Text>
                
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => navigateTo('/')}
                >
                  <Text style={styles.menuText}>🏠 ホーム (入力)</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => navigateTo('/history')}
                >
                  <Text style={styles.menuText}>📊 履歴一覧</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => navigateTo('/debug-test')}
                >
                  <Text style={styles.menuText}>🛠 接続テスト</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  // モーダル用スタイル
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // 背景を半透明に
    justifyContent: 'flex-start',
  },
  menuContent: {
    backgroundColor: Palette.background,
    width: '70%', // 画面の70%幅
    height: '100%',
    paddingTop: 60, // ステータスバー避け
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: Palette.text,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Palette.text,
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: Palette.secondary,
    alignSelf: 'flex-start',
    paddingBottom: 5,
  },
  menuItem: {
    paddingVertical: 15,
  },
  menuText: {
    fontSize: 18,
    color: Palette.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 15,
  },
});