import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';

export const HamburgerMenu = () => {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  const handleNavigate = (path: any) => { // pathの型は適宜調整
    setVisible(false);
    router.push(path);
  };

  return (
    <>
      <Pressable style={styles.button} onPress={() => setVisible(true)}>
        <Ionicons name="menu" size={28} color={Colors.light.primary} />
      </Pressable>

      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.menuContainer}>
            <Text style={styles.title}>EasyMoney</Text>
            
            {/* 履歴への遷移は削除し、設定のみ残す */}
            <Pressable style={styles.menuItem} onPress={() => handleNavigate('/settings')}>
              <Ionicons name="settings-outline" size={24} color={Colors.light.primary} />
              <Text style={styles.menuText}>設定</Text>
            </Pressable>

             {/* 将来的にアプリ紹介などを追加可能 */}
             <Pressable style={styles.menuItem} onPress={() => setVisible(false)}>
              <Ionicons name="information-circle-outline" size={24} color={Colors.light.primary} />
              <Text style={styles.menuText}>アプリについて</Text>
            </Pressable>

            <Pressable style={styles.closeButton} onPress={() => setVisible(false)}>
              <Text style={styles.closeText}>閉じる</Text>
            </Pressable>
          </View>
        </Pressable>
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
});