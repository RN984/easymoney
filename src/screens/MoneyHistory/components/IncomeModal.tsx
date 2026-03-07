// src/screens/MoneyHistory/components/IncomeModal.tsx
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../constants/theme';
import { CreateHouseholdDTO, LocationData } from '../../../index';
import { createHousehold } from '../../../services/transactionService';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const IncomeModal: React.FC<Props> = ({ visible, onClose, onSaved }) => {
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount <= 0) {
      return;
    }
    
    setLoading(true);
    try {
      // 収入カテゴリ（臨時収入）
      const incomeCategoryId = 'cat_extra_income';
      
      const location: LocationData | undefined = locationAddress.trim()
        ? { latitude: 0, longitude: 0, address: locationAddress.trim() }
        : undefined;
      
      const dto: CreateHouseholdDTO = {
        categoryId: incomeCategoryId,
        totalAmount: numAmount,
        memo: memo || undefined,
        location,
        createdAt: selectedDate,
      };
      
      await createHousehold(dto);
      onSaved();
      onClose();
      // Reset form
      setAmount('');
      setMemo('');
      setLocationAddress('');
      setSelectedDate(new Date());
    } catch (_) {
      // Error handled by service layer
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setMemo('');
    setLocationAddress('');
    setSelectedDate(new Date());
    setShowDatePicker(false);
    onClose();
  };

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date) => {
    return format(date, 'M/d(E) HH:mm', { locale: ja });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>収入を追加</Text>
          
          {/* 金額 */}
          <View style={styles.inputRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="cash-outline" size={20} color={Colors.light.primary} />
            </View>
            <TextInput 
              style={styles.input} 
              value={amount} 
              onChangeText={setAmount} 
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="#999"
            />
          </View>

          {/* 日時 */}
          <View style={styles.inputRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar-outline" size={20} color={Colors.light.primary} />
            </View>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(!showDatePicker)}>
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <View style={styles.datePickerContainer}>
              <TouchableOpacity onPress={() => handleDateChange(-1)} style={styles.dateArrow}>
                <Ionicons name="chevron-back" size={20} color={Colors.light.secondary} />
              </TouchableOpacity>
              <Text style={styles.dateDisplay}>{formatDate(selectedDate)}</Text>
              <TouchableOpacity onPress={() => handleDateChange(1)} style={styles.dateArrow}>
                <Ionicons name="chevron-forward" size={20} color={Colors.light.secondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* 位置情報 */}
          <View style={styles.inputRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="location-outline" size={20} color={Colors.light.primary} />
            </View>
            <TextInput 
              style={styles.input} 
              value={locationAddress} 
              onChangeText={setLocationAddress}
              placeholder="場所（任意）"
              placeholderTextColor="#999"
            />
          </View>

          {/* メモ */}
          <View style={styles.inputRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="document-text-outline" size={20} color={Colors.light.primary} />
            </View>
            <TextInput 
              style={styles.input} 
              value={memo} 
              onChangeText={setMemo}
              placeholder="メモ（任意）"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSave} 
              style={[styles.saveButton, !amount && styles.saveButtonDisabled]}
              disabled={!amount || loading}
            >
              {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.saveText}>保存</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#272D2D',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    backgroundColor: '#FAFAFA',
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  dateText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    marginLeft: 46,
  },
  dateArrow: {
    padding: 10,
  },
  dateDisplay: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    marginRight: 10,
  },
  cancelText: {
    color: '#666',
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
  },
  saveButtonDisabled: {
    backgroundColor: '#CCC',
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
