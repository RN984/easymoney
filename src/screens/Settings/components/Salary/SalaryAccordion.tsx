import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  LayoutAnimation,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import { Palette } from '../../../../constants/theme';
import { useSettings } from '../../hooks/useSettings';

// AndroidでLayoutAnimationを有効化
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// salaryDay: 0 = 月末, 1-28 = カスタム日付
export default function SalaryAccordion() {
  const { isLoading, baseSalary, salaryDay, handleUpdateBaseSalary, handleUpdateSalaryDay } = useSettings();
  
  const [expanded, setExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [salaryInput, setSalaryInput] = useState(String(baseSalary || 0));
  const [salaryDayInput, setSalaryDayInput] = useState(String(salaryDay || 1));
  const [isEndOfMonth, setIsEndOfMonth] = useState(salaryDay === 0);

  useEffect(() => {
    setSalaryInput(String(baseSalary || 0));
  }, [baseSalary]);

  useEffect(() => {
    setSalaryDayInput(String(salaryDay === 0 ? 1 : salaryDay));
    setIsEndOfMonth(salaryDay === 0);
  }, [salaryDay]);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const openModal = () => {
    setSalaryInput(String(baseSalary || 0));
    setSalaryDayInput(String(salaryDay === 0 ? 1 : salaryDay));
    setIsEndOfMonth(salaryDay === 0);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!salaryInput || salaryInput.trim().length === 0) {
      Alert.alert('入力エラー', '基本給を入力してください');
      return;
    }
    const val = Number(salaryInput.replace(/[^\d]/g, ''));
    if (isNaN(val) || val < 0) {
      Alert.alert('入力エラー', '正の数を入力してください');
      return;
    }
    const MAX = 100000000;
    if (val > MAX) {
      Alert.alert('入力エラー', `基本給は ${MAX.toLocaleString()} 以下にしてください`);
      return;
    }
    
    // 月末の場合は0、カスタムの場合は1-28の値
    const dayVal = isEndOfMonth ? 0 : Number(salaryDayInput);
    if (!isEndOfMonth && (isNaN(dayVal) || dayVal < 1 || dayVal > 28)) {
      Alert.alert('入力エラー', '給料日は1日から28日の間で入力してください');
      return;
    }

    await handleUpdateBaseSalary(val);
    await handleUpdateSalaryDay(dayVal);
    setModalVisible(false);
  };

  // 給料日の表示用
  const getSalaryDayDisplay = () => {
    if (salaryDay === 0) {
      return '毎月月末';
    }
    return `毎月${salaryDay}日`;
  };

  return (
    <View style={styles.container}>
      {/* Accordion Header */}
      <TouchableOpacity onPress={toggleExpand} style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="wallet-outline" size={20} color={Palette.text} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>固定収入設定</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#999"
        />
      </TouchableOpacity>

      {/* Accordion Body */}
      {expanded && (
        <View style={styles.body}>
          <TouchableOpacity style={styles.salaryItem} onPress={openModal}>
            <Text style={styles.salaryLabel}>基本給</Text>
            <Text style={styles.salaryValue}>¥{Number(baseSalary || 0).toLocaleString()}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.salaryItem} onPress={openModal}>
            <Text style={styles.salaryLabel}>給料日</Text>
            <Text style={styles.salaryValue}>{getSalaryDayDisplay()}</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>固定収入設定</Text>
            
            <Text style={styles.label}>基本給</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={salaryInput}
              onChangeText={(text) => setSalaryInput(text.replace(/[^\d]/g, ''))}
              placeholder="例: 300000"
            />

            <Text style={styles.label}>給料日</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.typeButton, !isEndOfMonth && styles.typeButtonActive]}
                onPress={() => setIsEndOfMonth(false)}
              >
                <Text style={[styles.typeButtonText, !isEndOfMonth && styles.typeButtonTextActive]}>
                  カスタム日付
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, isEndOfMonth && styles.typeButtonActive]}
                onPress={() => setIsEndOfMonth(true)}
              >
                <Text style={[styles.typeButtonText, isEndOfMonth && styles.typeButtonTextActive]}>
                  月末
                </Text>
              </TouchableOpacity>
            </View>

            {!isEndOfMonth && (
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={salaryDayInput}
                onChangeText={(text) => setSalaryDayInput(text.replace(/[^\d]/g, ''))}
                placeholder="例: 15"
                maxLength={2}
              />
            )}

            <View style={styles.modalButtons}>
              <Button title="キャンセル" onPress={() => setModalVisible(false)} />
              <Button
                title="保存"
                disabled={isLoading}
                onPress={handleSave}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Palette.text,
  },
  body: {
    backgroundColor: '#FAFAFA',
    paddingBottom: 8,
  },
  salaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  salaryLabel: {
    fontSize: 14,
    color: Palette.text,
  },
  salaryValue: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
    marginBottom: 8,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: Palette.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
});
