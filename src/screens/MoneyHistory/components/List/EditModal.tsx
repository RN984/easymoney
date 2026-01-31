import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../../../constants/theme';
import { Household, UpdateHouseholdDTO } from '../../../../index';
import { updateHousehold } from '../../../../services/transactionService';

interface Props {
  visible: boolean;
  targetItem: Household | null;
  onClose: () => void;
  onUpdated: () => void;
}

export const EditModal: React.FC<Props> = ({ visible, targetItem, onClose, onUpdated }) => {
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (targetItem) {
      setAmount(targetItem.totalAmount.toString());
      setMemo(targetItem.memo || '');
    }
  }, [targetItem]);

  const handleSave = async () => {
    if (!targetItem) return;
    setLoading(true);
    try {
      const updateData: UpdateHouseholdDTO = {
        totalAmount: parseInt(amount, 10) || 0,
        memo: memo,
      };
      await updateHousehold(targetItem.id, updateData);
      onUpdated();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>記録の編集</Text>
          
          <Text style={styles.label}>金額</Text>
          <TextInput 
            style={styles.input} 
            value={amount} 
            onChangeText={setAmount} 
            keyboardType="number-pad" 
          />

          <Text style={styles.label}>メモ</Text>
          <TextInput 
            style={styles.input} 
            value={memo} 
            onChangeText={setMemo} 
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
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
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: Colors.light.gray,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
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
});