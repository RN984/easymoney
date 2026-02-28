import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CustomCoin } from '../../../../index';

const PRESET_COLORS = [
  '#4CAF50', '#81C784', '#DB8479', '#6179B5', '#F4DA61', '#272D2D', '#A0A0A0',
  '#9C27B0', '#3F51B5', '#009688', '#FF9800', '#795548', '#E91E63', '#00BCD4',
];

const NAME_MAX_LENGTH = 6;
const MEMO_MAX_LENGTH = 20;

interface Props {
  visible: boolean;
  targetCoin: CustomCoin | null;
  onSave: (coin: CustomCoin) => void;
  onClose: () => void;
}

export default function CoinEditModal({ visible, targetCoin, onSave, onClose }: Props) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (visible) {
      if (targetCoin) {
        setName(targetCoin.name);
        setAmount(String(targetCoin.amount));
        setColor(targetCoin.color);
        setMemo(targetCoin.memo || '');
      } else {
        setName('');
        setAmount('');
        setColor(PRESET_COLORS[0]);
        setMemo('');
      }
    }
  }, [visible, targetCoin]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('エラー', '名前を入力してください');
      return;
    }
    const amountNum = Number(amount.replace(/[^\d]/g, ''));
    if (!amountNum || amountNum <= 0) {
      Alert.alert('エラー', '金額を正しく入力してください');
      return;
    }
    if (amountNum > 10000000) {
      Alert.alert('エラー', '金額は10,000,000以下にしてください');
      return;
    }

    const coin: CustomCoin = {
      id: targetCoin ? targetCoin.id : `coin_${Date.now()}`,
      name: name.trim(),
      amount: amountNum,
      color,
      order: targetCoin ? targetCoin.order : 0,
    };
    const trimmedMemo = memo.trim();
    if (trimmedMemo) {
      coin.memo = trimmedMemo;
    }
    onSave(coin);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{targetCoin ? 'コイン編集' : '新規コイン作成'}</Text>

            {/* プレビュー */}
            <View style={styles.previewArea}>
              <View style={[styles.coinPreview, { backgroundColor: color }]}>
                <Text style={styles.coinPreviewText} numberOfLines={1}>
                  {name || '?'}
                </Text>
              </View>
              {memo ? <Text style={styles.previewMemo} numberOfLines={1}>{memo}</Text> : null}
            </View>

            {/* 名前 */}
            <View style={styles.field}>
              <Text style={styles.label}>名前（最大{NAME_MAX_LENGTH}文字）</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="例: 家賃"
                maxLength={NAME_MAX_LENGTH}
              />
            </View>

            {/* 金額 */}
            <View style={styles.field}>
              <Text style={styles.label}>金額</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={(text) => setAmount(text.replace(/[^\d]/g, ''))}
                placeholder="例: 50000"
                keyboardType="numeric"
              />
            </View>

            {/* カラー選択 */}
            <View style={styles.field}>
              <Text style={styles.label}>カラー</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.palette}>
                {PRESET_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.swatch, { backgroundColor: c }, color === c && styles.selectedSwatch]}
                    onPress={() => setColor(c)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* メモ */}
            <View style={styles.field}>
              <Text style={styles.label}>メモ（最大{MEMO_MAX_LENGTH}文字・任意）</Text>
              <TextInput
                style={styles.input}
                value={memo}
                onChangeText={setMemo}
                placeholder="例: 毎月の家賃"
                maxLength={MEMO_MAX_LENGTH}
              />
            </View>

            {/* ボタン */}
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onClose}>
                <Text style={styles.btnTextCancel}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.save, { backgroundColor: color }]} onPress={handleSave}>
                <Text style={styles.btnTextSave}>保存</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

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
    maxHeight: '85%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#272D2D',
  },
  previewArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  coinPreview: {
    width: 63,
    height: 63,
    borderRadius: 31.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  coinPreviewText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  previewMemo: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FAFAFA',
    fontSize: 16,
  },
  palette: {
    flexDirection: 'row',
  },
  swatch: {
    width: 33,
    height: 33,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedSwatch: {
    borderColor: '#272D2D',
    transform: [{ scale: 1.1 }],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  btn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancel: {
    backgroundColor: '#F0F0F0',
    marginRight: 10,
  },
  save: {
    backgroundColor: '#6179B5',
  },
  btnTextCancel: {
    color: '#666',
    fontWeight: 'bold',
  },
  btnTextSave: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
