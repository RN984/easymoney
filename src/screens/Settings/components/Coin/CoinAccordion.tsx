import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Palette } from '../../../../constants/theme';
import { CoinSettings, CoinValue, CustomCoin } from '../../../../index';
import { fetchCoinSettings, updateCoinSettings } from '../../../../services/masterService';
import { syncCoinsToWidget } from '../../../../services/widgetService';
import CoinEditModal from './CoinEditModal';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DEFAULT_COINS: { value: CoinValue; label: string }[] = [
  { value: 10000, label: '¥10,000' },
  { value: 5000, label: '¥5,000' },
  { value: 1000, label: '¥1,000' },
  { value: 500, label: '¥500' },
  { value: 100, label: '¥100' },
  { value: 50, label: '¥50' },
  { value: 10, label: '¥10' },
];

const MAX_CUSTOM_COINS = 2;

export default function CoinAccordion() {
  const [expanded, setExpanded] = useState(false);
  const [settings, setSettings] = useState<CoinSettings>({ hiddenCoins: [], customCoins: [] });
  const [loaded, setLoaded] = useState(false);

  // モーダル用
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCoin, setEditingCoin] = useState<CustomCoin | null>(null);

  useEffect(() => {
    if (expanded && !loaded) {
      loadData();
    }
  }, [expanded]);

  const loadData = async () => {
    const data = await fetchCoinSettings();
    setSettings(data);
    setLoaded(true);
  };

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const toggleDefaultCoin = async (value: CoinValue) => {
    const hiddenCoins = settings.hiddenCoins.includes(value)
      ? settings.hiddenCoins.filter((v) => v !== value)
      : [...settings.hiddenCoins, value];

    // 全部非表示 + カスタムコイン0個は不可
    if (hiddenCoins.length === DEFAULT_COINS.length && settings.customCoins.length === 0) {
      Alert.alert('エラー', '最低1つのコインを表示してください');
      return;
    }

    const updated = { ...settings, hiddenCoins };
    setSettings(updated);
    await updateCoinSettings(updated);
    syncCoinsToWidget(updated);
  };

  const openEditModal = (coin: CustomCoin | null) => {
    setEditingCoin(coin);
    setModalVisible(true);
  };

  const handleSave = async (coin: CustomCoin) => {
    let updatedCoins: CustomCoin[];
    if (editingCoin) {
      updatedCoins = settings.customCoins.map((c) => (c.id === coin.id ? coin : c));
    } else {
      coin.order = settings.customCoins.length;
      updatedCoins = [...settings.customCoins, coin];
    }

    const updated = { ...settings, customCoins: updatedCoins };
    setSettings(updated);
    await updateCoinSettings(updated);
    syncCoinsToWidget(updated);
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('削除確認', 'このカスタムコインを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          const updatedCoins = settings.customCoins.filter((c) => c.id !== id);
          const updated = { ...settings, customCoins: updatedCoins };
          setSettings(updated);
          await updateCoinSettings(updated);
          syncCoinsToWidget(updated);
        },
      },
    ]);
  };

  const renderRightActions = (coin: CustomCoin) => (
    <View style={styles.actionContainer}>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: Palette.secondary }]}
        onPress={() => openEditModal(coin)}
      >
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.actionText}>編集</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: Palette.accent }]}
        onPress={() => handleDelete(coin.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#fff" />
        <Text style={styles.actionText}>削除</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Accordion Header */}
      <TouchableOpacity onPress={toggleExpand} style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="ellipse-outline" size={20} color={Palette.text} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>コインリスト設定</Text>
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
          {/* デフォルトコイン */}
          <Text style={styles.sectionLabel}>デフォルトコイン</Text>
          {DEFAULT_COINS.map(({ value, label }) => (
            <View key={value} style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>{label}</Text>
              <Switch
                value={!settings.hiddenCoins.includes(value)}
                onValueChange={() => toggleDefaultCoin(value)}
                trackColor={{ false: '#E0E0E0', true: Palette.primary }}
                thumbColor="#fff"
              />
            </View>
          ))}

          {/* カスタムコイン */}
          <View style={styles.customHeader}>
            <Text style={styles.sectionLabel}>カスタムコイン（{settings.customCoins.length}/{MAX_CUSTOM_COINS}）</Text>
            {settings.customCoins.length < MAX_CUSTOM_COINS && (
              <TouchableOpacity onPress={() => openEditModal(null)} style={styles.addBtn}>
                <Text style={styles.addBtnText}>＋ 追加</Text>
              </TouchableOpacity>
            )}
          </View>

          {settings.customCoins.length === 0 && (
            <Text style={styles.emptyText}>カスタムコインはまだありません</Text>
          )}

          {settings.customCoins
            .sort((a, b) => a.order - b.order)
            .map((coin) => (
              <Swipeable key={coin.id} renderRightActions={() => renderRightActions(coin)}>
                <View style={styles.customCoinRow}>
                  <View style={[styles.coinCircle, { backgroundColor: coin.color }]}>
                    <Text style={styles.coinCircleText} numberOfLines={1}>{coin.name}</Text>
                  </View>
                  <View style={styles.coinInfo}>
                    <Text style={styles.coinName}>{coin.name}</Text>
                    <Text style={styles.coinAmount}>¥{coin.amount.toLocaleString()}</Text>
                    {coin.memo ? <Text style={styles.coinMemo}>{coin.memo}</Text> : null}
                  </View>
                </View>
              </Swipeable>
            ))}
        </View>
      )}

      <CoinEditModal
        visible={modalVisible}
        targetCoin={editingCoin}
        onSave={handleSave}
        onClose={() => setModalVisible(false)}
      />
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
    paddingBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  toggleLabel: {
    fontSize: 14,
    color: Palette.text,
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    paddingTop: 8,
  },
  addBtn: {
    backgroundColor: Palette.primary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 12,
    color: '#BBB',
    textAlign: 'center',
    paddingVertical: 12,
  },
  customCoinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  coinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  coinCircleText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  coinInfo: {
    flex: 1,
  },
  coinName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Palette.text,
  },
  coinAmount: {
    fontSize: 12,
    color: '#666',
  },
  coinMemo: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  actionContainer: {
    flexDirection: 'row',
    width: 140,
    marginBottom: 4,
    marginRight: 10,
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 2,
  },
  actionText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 4,
  },
});
