import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { FontAwesome, FontAwesome5, Ionicons, AntDesign } from '@expo/vector-icons';
import { Patient } from '@interfaces';
import { g } from '@styles';
import { Image } from 'expo-image';
import { formatPhoneNumber } from '@utils';

const s = StyleSheet.create({
  addressContainer: {
    flex: 1,
  },
  addressLine: {
    ...g.bodySmall,
    color: g.white,
  },
  addressRow: {
    alignItems: 'flex-start',
  },
  // ...g.shadow, // TODO: I'm leaving this here for now. It was causing a performance warning but I'd like to revisit it if we end up using it.
  dataColumn: {
    flex: 1,
    gap: g.size(8),
  },
  dataContainer: {
    flexDirection: 'row',
    gap: g.size(8),
  },
  dataPoint: {
    ...g.bodySmall,
    color: g.white,
    flex: 1,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: g.size(8),
  },
  iconContainer: {
    width: g.size(20),
    height: g.size(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: g.size(6),
    marginTop: g.size(16),
  },
  logoutLabel: {
    ...g.labelSmall,
    color: g.white,
    textDecorationLine: 'underline',
  },
  profileCard: {
    borderRadius: g.size(8),
    overflow: 'hidden',
  },
  profileCardBlur: {
    width: '100%',
    padding: g.size(16),
    alignItems: 'flex-start',
    gap: g.size(12),
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: g.size(12),
  },
  userImage: {
    width: g.size(48),
    height: g.size(48),
    borderRadius: g.size(24),
  },
  userName: {
    ...g.bodyXLarge,
    color: g.white,
  },
  userNameAddressContainer: {
    flex: 1,
    gap: g.size(4),
  },
});

const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);
const formattedDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'utc' });

export function ProfileCard({ data }: { data: Patient }) {
  const phoneNumber = formatPhoneNumber(data.telecom.find((t) => t.system === 'phone')?.value);
  const email = data.telecom.find((t) => t.system === 'email')?.value;
  return (
    <>
      <View style={s.profileCard}>
        <BlurView
          style={s.profileCardBlur}
          tint="light"
          intensity={40}
        >
          <View style={s.userContainer}>
            {data?.photo[0]?.url ? (
              <Image source={{ uri: data.photo[0].url }} style={s.userImage} />
            ) : (
              <FontAwesome name="user-circle-o" size={g.size(48)} color={g.white} />
            )}
            <View style={s.userNameAddressContainer}>
              <Text
                style={s.userName}
                numberOfLines={1}
              >
                {`${data.name[0].given[0]} ${data.name[0].family}`}
              </Text>
            </View>
          </View>
          <View style={s.dataContainer}>
            <View style={s.dataColumn}>
              {!!data?.birthDate && (
                <View style={s.dataRow}>
                  <View style={s.iconContainer}>
                    <FontAwesome name="birthday-cake" size={g.size(14)} color={g.white} />
                  </View>
                  <Text
                    style={s.dataPoint}
                    numberOfLines={1}
                  >
                    {formattedDate(data.birthDate)}
                  </Text>
                </View>
              )}
              {!!phoneNumber && (
                <View style={s.dataRow}>
                  <View style={s.iconContainer}>
                    <FontAwesome5 name="phone-alt" size={g.size(14)} color={g.white} />
                  </View>
                  <Text
                    style={s.dataPoint}
                    numberOfLines={1}
                  >
                    {phoneNumber}
                  </Text>
                </View>
              )}
              {!!email && (
                <View style={s.dataRow}>
                  <View style={s.iconContainer}>
                    <FontAwesome name="envelope" size={g.size(14)} color={g.white} />
                  </View>
                  <Text
                    style={s.dataPoint}
                    numberOfLines={1}
                  >
                    {email}
                  </Text>
                </View>
              )}
            </View>
            <View style={s.dataColumn}>
              {!!data.gender && (
                <View style={s.dataRow}>
                  <View style={s.iconContainer}>
                    <FontAwesome name="user" size={g.size(14)} color={g.white} />
                  </View>
                  <Text
                    style={s.dataPoint}
                    numberOfLines={1}
                  >
                    {`${data.gender !== ('male' || 'female') && 'Gender: '}${capitalizeFirstLetter(data.gender)}`}
                  </Text>
                </View>
              )}
              {!!data?.address && (
                <View style={[s.dataRow, s.addressRow]}>
                  <View style={s.iconContainer}>
                    <Ionicons name="home" size={g.size(14)} color={g.white} />
                  </View>
                  <View style={s.addressContainer}>
                    <Text
                      style={s.addressLine}
                      numberOfLines={1}
                    >
                      {data.address[0]?.line[0]}
                    </Text>
                    <Text
                      style={s.addressLine}
                      numberOfLines={1}
                    >
                      {`${data.address[0]?.city}, ${data.address[0]?.state} ${data.address[0]?.postalCode}`}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </BlurView>
      </View>
      <TouchableOpacity
        style={s.logoutButton}
        onPress={() =>
          Alert.alert(
            'Are you sure?',
            'Your data will become inaccessible and you will be logged out.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Log Out',
                style: 'destructive',
                onPress: () => {
                  SecureStore.deleteItemAsync('patient_id');
                  SecureStore.deleteItemAsync('push_token');
                  router.replace('initial');
                },
              },
            ]
          )
        }
      >
        <Text style={s.logoutLabel}>Log Out</Text>
        <AntDesign name="logout" size={g.size(16)} color={g.white} />
      </TouchableOpacity>
    </>
  );
}
