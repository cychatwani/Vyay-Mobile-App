import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import SafeView from "@/components/custom/SafeView/SafeView";
import MainHeaderBar from "@/components/MainHeaderBar";
import { useColors } from "@/store/themeStore";
import TabSwitcher from "@/components/friends/TabSwitcher";
import FriendCard from "@/components/friends/FriendCard";
import FriendsInfoNote from "@/components/friends/FriendsInfoNote";
import GroupCard from "@/components/friends/groupCard";
import { useRouter } from "expo-router";


const friends = () => {
  const friends = [
    {
      id: "1",
      firstName: "Rahul",
      lastName: "Sharma",
      email: "rahul@email.com",
      photoUrl: "https://i.pravatar.cc/150?img=1",
      balance: 450.5,
    },
    {
      id: "2",
      firstName: "Priya",
      lastName: "Patel",
      email: "priya@email.com",
      balance: -320.0,
    },
    {
      id: "3",
      firstName: "Amit",
      lastName: "Kumar",
      email: "amit@email.com",
      photoUrl: "https://i.pravatar.cc/150?img=3",
      balance: 0,
    },
  ];
  const groups = [
    {
      id: "1",
      name: "Goa Trip 2024",
      memberCount: 5,
      coverImage: "https://picsum.photos/200",
      balance: 1250.00,
      totalExpenses: 12500.00,
    },
    {
      id: "2",
      name: "Office Team",
      memberCount: 8,
      balance: -450.50,
      totalExpenses: 5600.00,
    },
    {
      id: "3",
      name: "College Friends",
      memberCount: 12,
      coverImage: "https://picsum.photos/201",
      balance: 0,
      totalExpenses: 8900.00,
    },
  ];
  const [activeTab, setActiveTab] = useState<"friends" | "groups">("friends");
  const colors = useColors();
  const router = useRouter();

  return (
    <SafeView
      style={{ flex: 1, backgroundColor: colors.background }}
      statusBarColor={colors.background}
      statusBarStyle="dark-content"
    >
      <MainHeaderBar />
      <TabSwitcher
        activeTab={activeTab}
        onTabChange={setActiveTab}
        friendsCount={4}
        groupsCount={3}
      />
      <FriendsInfoNote />
      <ScrollView>
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          onPress={() => router.push({
            pathname: "/(groupDetail)/groupDetail",
            params: { id: "123" },
          })}
        />
      ))}
    </ScrollView>
    </SafeView>
  );
};

export default friends;

const styles = StyleSheet.create({});
