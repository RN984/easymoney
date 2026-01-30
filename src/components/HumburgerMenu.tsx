import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Palette } from '../../constants/theme';

export const HamburgerMenu: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  const handleNavigate = (route: string) => {
    setVisible(false);
    // expo-routerの型定義に合わせてキャスト
    router.push(route as any);
  };

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} style={styles.iconButton}>
        {/* ハンバーガーアイコン (3本線) */}
        <View style={styles.line} />
        <View style={styles.line} />
        <View style={styles.line} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Menu</Text>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('/')}>
              <Text style={styles.menuText}>🏠 ホーム (入力)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('/history')}>
              <Text style={styles.menuText}>📊 履歴・グラフ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('/settings')}>
              <Text style={styles.menuText}>⚙️ 設定</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('/debug-test')}>
              <Text style={styles.menuText}>🔧 接続テスト</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
  },
  line: {
    width: 20,
    height: 2,
    backgroundColor: Palette.text,
    marginVertical: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    width: '70%',
    height: '100%',
    backgroundColor: Palette.background,
    padding: 20,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: Palette.text,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    fontSize: 18,
    color: Palette.text,
  },
});