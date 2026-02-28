import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Colors } from '../../../../constants/theme';
import { Category, CategoryType, Household, LocationData, UpdateHouseholdDTO } from '../../../../index';
import { createHousehold, updateHousehold } from '../../../../services/transactionService';

interface Props {
  visible: boolean;
  targetItem: Household | null;
  onClose: () => void;
  onUpdated: () => void;
  categories?: Category[];
  inputType?: CategoryType;
  selectedCategoryId?: string;
}

export const EditModal: React.FC<Props> = ({ visible, targetItem, onClose, onUpdated, categories = [], inputType = 'expense', selectedCategoryId: propsSelectedCategoryId }) => {
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  const isCreateMode = !targetItem;

  useEffect(() => {
    if (targetItem) {
      setAmount(targetItem.totalAmount.toString());
      setMemo(targetItem.memo || '');
      setLocationAddress(targetItem.location?.address || '');
      setSelectedCategoryId(targetItem.categoryId);
      const date = new Date(targetItem.createdAt);
      setSelectedDate(date);
      setHour(String(date.getHours()).padStart(2, '0'));
      setMinute(String(date.getMinutes()).padStart(2, '0'));
    } else {
      // Create mode - reset fields
      setAmount('');
      setMemo('');
      setLocationAddress('');
      setSelectedDate(new Date());
      setHour(String(new Date().getHours()).padStart(2, '0'));
      setMinute(String(new Date().getMinutes()).padStart(2, '0'));
      // Use props category if available, otherwise default to first
      if (propsSelectedCategoryId) {
        setSelectedCategoryId(propsSelectedCategoryId);
      } else {
        const filteredCategories = categories.filter(c => c.type === inputType);
        if (filteredCategories.length > 0) {
          setSelectedCategoryId(filteredCategories[0].id);
        }
      }
    }
  }, [targetItem, visible, categories, inputType, propsSelectedCategoryId]);

  const handleSave = async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const location: LocationData | undefined = locationAddress.trim() 
        ? { latitude: 0, longitude: 0, address: locationAddress.trim() }
        : undefined;

      const createdAt = (() => {
        const d = new Date(selectedDate);
        const h = Math.min(23, Math.max(0, parseInt(hour || '0', 10) || 0));
        const m = Math.min(59, Math.max(0, parseInt(minute || '0', 10) || 0));
        d.setHours(h, m, 0, 0);
        return d;
      })();

      if (isCreateMode) {
        // Create mode - use createHousehold
        if (!selectedCategoryId) {
          console.error('カテゴリが選択されていません');
          setLoading(false);
          return;
        }
        const newHousehold: Household = {
          id: '',
          categoryId: selectedCategoryId,
          totalAmount: parseInt(amount, 10) || 0,
          memo: memo,
          location,
          createdAt,
        };
        await createHousehold(newHousehold);
      } else {
        // Edit mode - use updateHousehold
        const updateData: UpdateHouseholdDTO = {
          totalAmount: parseInt(amount, 10) || 0,
          memo: memo,
          location,
          createdAt,
        };
        await updateHousehold(targetItem.id, updateData);
      }
      onUpdated();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const handleHourChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '').slice(0, 2);
    setHour(digits);
  };

  const handleMinuteChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '').slice(0, 2);
    setMinute(digits);
  };

  const normalizeHour = () => {
    if (hour === '') {
      setHour('00');
      return;
    }
    const normalized = String(Math.min(23, Math.max(0, parseInt(hour, 10) || 0))).padStart(2, '0');
    setHour(normalized);
  };

  const normalizeMinute = () => {
    if (minute === '') {
      setMinute('00');
      return;
    }
    const normalized = String(Math.min(59, Math.max(0, parseInt(minute, 10) || 0))).padStart(2, '0');
    setMinute(normalized);
  };

  const formatDate = (date: Date) => {
    return format(date, 'M/d(E) HH:mm', { locale: ja });
  };

  const formatDateOnly = (date: Date) => {
    return format(date, 'M/d(E)', { locale: ja });
  };

  // Determine the category type to use
  // For create mode: use inputType prop
  // For edit mode: use the category type from the transaction's category
  const getCategoryType = () => {
    if (targetItem) {
      const category = categories.find(c => c.id === targetItem.categoryId);
      return category?.type || 'expense';
    }
    // For create mode with income type, only show 臨時収入
    if (inputType === 'income') {
      return 'income';
    }
    return inputType;
  };

  const categoryType = getCategoryType();

  // Filter categories by determined category type
  const filteredCategories = categoryType === 'income' 
    ? categories.filter(c => c.type === 'income' && c.name === '臨時収入')
    : categories.filter(c => c.type === categoryType);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            <Text style={styles.title}>{isCreateMode ? '新規追加' : '記録の編集'}</Text>
          
          {/* カテゴリ選択（作成モード・編集モード） */}
          {filteredCategories.length > 0 && (
            <View style={styles.inputRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="pricetag-outline" size={20} color={Colors.light.gray} />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {filteredCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      selectedCategoryId === category.id && { backgroundColor: category.color }
                    ]}
                    onPress={() => setSelectedCategoryId(category.id)}
                  >
                    <Ionicons 
                      name={category.icon as any} 
                      size={14} 
                      color={selectedCategoryId === category.id ? '#fff' : category.color} 
                      style={styles.categoryIcon}
                    />
                    <Text style={[
                      styles.categoryChipText,
                      selectedCategoryId === category.id && { color: '#fff' }
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 金額 */}
          <View style={styles.inputRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="cash-outline" size={20} color={Colors.light.gray} />
            </View>
            <TextInput 
              style={styles.input} 
              value={amount} 
              onChangeText={setAmount} 
              keyboardType="number-pad" 
              placeholder="金額"
              placeholderTextColor="#999"
            />
          </View>

          {/* 日時 */}
          <View style={styles.inputRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar-outline" size={20} color={Colors.light.gray} />
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
              <Text style={styles.dateDisplay}>{formatDateOnly(selectedDate)}</Text>
              <TouchableOpacity onPress={() => handleDateChange(1)} style={styles.dateArrow}>
                <Ionicons name="chevron-forward" size={20} color={Colors.light.secondary} />
              </TouchableOpacity>
            </View>
          )}

          {showDatePicker && (
            <View style={styles.timePickerContainer}>
              <TextInput
                style={styles.timeInput}
                value={hour}
                onChangeText={handleHourChange}
                onBlur={normalizeHour}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="HH"
                placeholderTextColor="#999"
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={styles.timeInput}
                value={minute}
                onChangeText={handleMinuteChange}
                onBlur={normalizeMinute}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="MM"
                placeholderTextColor="#999"
              />
            </View>
          )}

          {/* 位置情報 */}
          <View style={styles.inputRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="location-outline" size={20} color={Colors.light.gray} />
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
              <Ionicons name="document-text-outline" size={20} color={Colors.light.gray} />
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
            <TouchableOpacity onPress={() => { Keyboard.dismiss(); onClose(); }} style={styles.cancelButton}>
              <Text>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.saveText}>保存</Text>}
            </TouchableOpacity>
          </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
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
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  dateArrow: {
    padding: 10,
  },
  dateDisplay: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  timeInput: {
    width: 64,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  timeSeparator: {
    fontSize: 20,
    color: Colors.light.text,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelButton: {
    padding: 10,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  categoryScroll: {
    flex: 1,
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#333',
  },
  categoryIcon: {
    marginRight: 4,
  },
});
