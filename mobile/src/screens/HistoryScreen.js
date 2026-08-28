import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { getColors } from '../theme/colors';
import { groupedHistoryData } from '../data/mockData';

const TABS = ['All Conversations', 'Today', 'Yesterday', 'This Week', 'This Month', 'Custom'];
const CONV_TYPES = [
  'General Queries',
  'Weather Forecast',
  'Alerts & Warnings',
  'Air Quality',
  'Travel & Activities',
  'Other'
];

export function HistoryScreen({ isDark = false, onNavigate }) {
  const c = getColors(isDark);
  const { width } = useWindowDimensions();
  const isWide = width > 768;

  const [activeTab, setActiveTab] = useState('All Conversations');
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(['General Queries', 'Weather Forecast', 'Alerts & Warnings']);
  const [sortBy, setSortBy] = useState('Most Recent');

  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const getTagStyle = (tagType) => {
    switch (tagType) {
      case 'alert':
        return {
          bg: isDark ? '#3D1C1B' : '#FEF2F2',
          text: '#EF4444'
        };
      case 'forecast':
        return {
          bg: isDark ? '#362413' : '#FFFBEB',
          text: '#D97706'
        };
      case 'air':
        return {
          bg: isDark ? '#14382A' : '#ECFDF5',
          text: '#10B981'
        };
      case 'query':
      default:
        return {
          bg: isDark ? '#1C2E4A' : '#EFF6FF',
          text: '#2563EB'
        };
    }
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Search & Actions Header */}
      <View style={[styles.topSearchBar, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={[styles.searchBox, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search conversations..."
            placeholderTextColor={c.muted}
            style={[styles.searchInput, { color: c.ink }]}
          />
        </View>

        <View style={styles.topActionsRow}>
          <View style={[styles.dateDropdown, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
            <Text style={styles.dateIcon}>📅</Text>
            <Text style={[styles.dateText, { color: c.ink }]}>Date</Text>
            <Text style={[styles.chevron, { color: c.muted }]}>▾</Text>
          </View>

          <Pressable
            onPress={() => onNavigate('chat')}
            style={[styles.newChatBtn, { backgroundColor: c.blue }]}
          >
            <Text style={styles.newChatText}>+ New Chat</Text>
          </Pressable>
        </View>
      </View>

      {/* Filter Tabs Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabItem,
                isActive && { borderBottomColor: c.blue, borderBottomWidth: 2 }
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? c.blue : c.muted },
                  isActive && styles.tabTextActive
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Main Grid: Left Timeline List + Right Filter & Summary Column */}
      <View style={[styles.mainGrid, isWide && styles.mainGridWide]}>
        {/* Left Column: Grouped Conversation Threads */}
        <View style={[styles.col, isWide && styles.colLeft]}>
          {groupedHistoryData.map(group => (
            <View key={group.group} style={styles.groupBlock}>
              <Text style={[styles.groupHeader, { color: c.ink }]}>{group.group}</Text>
              <View style={[styles.groupCard, { backgroundColor: c.card, borderColor: c.border }]}>
                {group.items.map((item, idx) => {
                  const tagColors = getTagStyle(item.tagType);
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => onNavigate('chat')}
                      style={({ pressed }) => [
                        styles.historyItemRow,
                        { borderBottomColor: c.borderLight },
                        idx === group.items.length - 1 && { borderBottomWidth: 0 },
                        pressed && styles.pressed
                      ]}
                    >
                      <View style={[styles.itemIconBadge, { backgroundColor: c.cardAlt }]}>
                        <Text style={styles.itemIconText}>{item.icon}</Text>
                      </View>

                      <View style={styles.itemCopy}>
                        <View style={styles.itemTopRow}>
                          <Text style={[styles.itemTitle, { color: c.ink }]} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={[styles.itemTime, { color: c.muted }]}>{item.time}</Text>
                        </View>
                        <Text style={[styles.itemDesc, { color: c.muted }]} numberOfLines={2}>
                          {item.desc}
                        </Text>
                      </View>

                      <View style={[styles.tagBadge, { backgroundColor: tagColors.bg }]}>
                        <Text style={[styles.tagText, { color: tagColors.text }]}>{item.tag}</Text>
                      </View>

                      <Text style={[styles.moreMenu, { color: c.muted }]}>⋮</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Footer No more conversations */}
          <View style={styles.footerNoteRow}>
            <Text style={[styles.footerIcon, { color: c.muted }]}>🕒</Text>
            <Text style={[styles.footerText, { color: c.muted }]}>
              No more conversations to load
            </Text>
          </View>
        </View>

        {/* Right Column: Filters, History Summary, Storage Usage */}
        <View style={[styles.col, isWide && styles.colRight]}>
          {/* Filters Card */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardTitle, { color: c.ink }]}>Filters</Text>
              <Pressable onPress={() => setSelectedTypes([])}>
                <Text style={[styles.clearAllText, { color: c.blue }]}>Clear All</Text>
              </Pressable>
            </View>

            <Text style={[styles.filterSubheader, { color: c.muted }]}>Date Range</Text>
            <View style={[styles.dropdownSelect, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={[styles.dropdownText, { color: c.ink }]}>All Time</Text>
              <Text style={[styles.chevron, { color: c.muted }]}>▾</Text>
            </View>

            <Text style={[styles.filterSubheader, { color: c.muted, marginTop: 10 }]}>
              Conversation Type
            </Text>
            <View style={styles.typesList}>
              {CONV_TYPES.map(type => {
                const isChecked = selectedTypes.includes(type);
                return (
                  <Pressable
                    key={type}
                    onPress={() => toggleType(type)}
                    style={styles.checkboxRow}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        { borderColor: isChecked ? c.blue : c.border },
                        isChecked && { backgroundColor: c.blue }
                      ]}
                    >
                      {isChecked && <Text style={styles.checkIcon}>✓</Text>}
                    </View>
                    <Text style={[styles.checkboxLabel, { color: c.inkSecondary }]}>{type}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.filterSubheader, { color: c.muted, marginTop: 10 }]}>
              Sort By
            </Text>
            <View style={[styles.dropdownSelect, { backgroundColor: c.cardAlt, borderColor: c.border }]}>
              <Text style={[styles.dropdownText, { color: c.ink }]}>{sortBy}</Text>
              <Text style={[styles.chevron, { color: c.muted }]}>▾</Text>
            </View>
          </View>

          {/* History Summary Card */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.summaryTitleRow}>
              <Text style={styles.summaryIcon}>📊</Text>
              <Text style={[styles.cardTitle, { color: c.ink }]}>History Summary</Text>
            </View>
            <View style={styles.summaryStatsList}>
              <View style={styles.summaryStatItem}>
                <Text style={[styles.summaryStatLabel, { color: c.muted }]}>Total Conversations</Text>
                <Text style={[styles.summaryStatVal, { color: c.ink }]}>48</Text>
              </View>
              <View style={styles.summaryStatItem}>
                <Text style={[styles.summaryStatLabel, { color: c.muted }]}>This Week</Text>
                <Text style={[styles.summaryStatVal, { color: c.ink }]}>12</Text>
              </View>
              <View style={styles.summaryStatItem}>
                <Text style={[styles.summaryStatLabel, { color: c.muted }]}>This Month</Text>
                <Text style={[styles.summaryStatVal, { color: c.ink }]}>28</Text>
              </View>
              <View style={styles.summaryStatItem}>
                <Text style={[styles.summaryStatLabel, { color: c.muted }]}>Total Messages</Text>
                <Text style={[styles.summaryStatVal, { color: c.ink }]}>156</Text>
              </View>
            </View>
          </View>

          {/* Storage Usage Card */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.summaryTitleRow}>
              <Text style={styles.summaryIcon}>☁️</Text>
              <Text style={[styles.cardTitle, { color: c.ink }]}>Storage Usage</Text>
            </View>
            <Text style={[styles.storageText, { color: c.muted }]}>
              You've used 45% of your history storage.
            </Text>

            {/* Progress bar */}
            <View style={[styles.storageTrack, { backgroundColor: c.cardAlt }]}>
              <View style={[styles.storageFill, { backgroundColor: c.blue }]} />
            </View>
            <Text style={[styles.percentLabel, { color: c.muted }]}>45%</Text>

            <Pressable style={[styles.upgradeMoreBtn, { borderColor: c.blue }]}>
              <Text style={[styles.upgradeMoreText, { color: c.blue }]}>Upgrade for More</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  contentContainer: {
    padding: 12,
    paddingBottom: 36,
    gap: 12
  },
  topSearchBar: {
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    gap: 8
  },
  searchIcon: {
    fontSize: 14
  },
  searchInput: {
    flex: 1,
    fontSize: 13
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  dateDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1
  },
  dateIcon: {
    fontSize: 12
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600'
  },
  chevron: {
    fontSize: 10
  },
  newChatBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12
  },
  newChatText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  tabsRow: {
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
    paddingBottom: 2
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 4
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600'
  },
  tabTextActive: {
    fontWeight: '800'
  },
  mainGrid: {
    gap: 12
  },
  mainGridWide: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  col: {
    gap: 12
  },
  colLeft: {
    flex: 7
  },
  colRight: {
    flex: 5
  },
  groupBlock: {
    gap: 6
  },
  groupHeader: {
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 4
  },
  groupCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12
  },
  historyItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10
  },
  itemIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  itemIconText: {
    fontSize: 16
  },
  itemCopy: {
    flex: 1
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    paddingRight: 6
  },
  itemTime: {
    fontSize: 9
  },
  itemDesc: {
    fontSize: 11,
    lineHeight: 15
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'center'
  },
  tagText: {
    fontSize: 9,
    fontWeight: '700'
  },
  moreMenu: {
    fontSize: 14,
    paddingHorizontal: 4,
    alignSelf: 'center'
  },
  footerNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14
  },
  footerIcon: {
    fontSize: 12
  },
  footerText: {
    fontSize: 11
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 10
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800'
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: '700'
  },
  filterSubheader: {
    fontSize: 10,
    fontWeight: '700'
  },
  dropdownSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1
  },
  dropdownText: {
    fontSize: 12,
    fontWeight: '600'
  },
  typesList: {
    gap: 8,
    marginTop: 4
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900'
  },
  checkboxLabel: {
    fontSize: 11,
    fontWeight: '600'
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  summaryIcon: {
    fontSize: 16
  },
  summaryStatsList: {
    gap: 8
  },
  summaryStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  summaryStatLabel: {
    fontSize: 11
  },
  summaryStatVal: {
    fontSize: 12,
    fontWeight: '800'
  },
  storageText: {
    fontSize: 11
  },
  storageTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden'
  },
  storageFill: {
    width: '45%',
    height: '100%',
    borderRadius: 4
  },
  percentLabel: {
    fontSize: 9,
    textAlign: 'right'
  },
  upgradeMoreBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: 'center'
  },
  upgradeMoreText: {
    fontSize: 11,
    fontWeight: '700'
  },
  pressed: {
    opacity: 0.75
  }
});
