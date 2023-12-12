/* eslint-disable react/jsx-no-useless-fragment */
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useCreateAppointment, useSchedule, useSlot } from '@services';
import { formatTime } from '@utils';
import { Schedule, Slot } from '@interfaces';
import { Button, StackListView } from '@components';
import { g } from '@styles';

const s = StyleSheet.create({
  bookButton: {
    position: 'absolute',
    bottom: g.size(32),
    left: g.size(16),
    right: g.size(16),
  },
  buttonSelected: {
    backgroundColor: g.white,
  },
  labelSelected: {
    color: g.primaryBlue,
    opacity: 1,
  },
  loading: {
    flex: 1,
    paddingBottom: g.size(120),
  },
  practitionerButtonsContainer: {
    gap: g.size(16),
    alignItems: 'flex-start',
  },
  practitionerIcon: {
    opacity: 0.8,
  },
  practitionerIconSelected: {
    opacity: 1,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: g.size(8),
    paddingHorizontal: g.size(16),
    paddingVertical: g.size(8),
    overflow: 'hidden',
    borderRadius: g.size(32),
  },
  scheduleButtonLabel: {
    ...g.bodyLarge,
    color: g.white,
    flexShrink: 1,
    opacity: 0.8,
  },
  sectionContainer: {
    gap: g.size(12),
  },
  sectionHeader: {
    ...g.labelLarge,
    color: g.white,
    marginLeft: g.size(4),
  },
  slotButton: {
    paddingHorizontal: g.size(12),
    paddingVertical: g.size(4),
    borderRadius: g.size(32),
    overflow: 'hidden',
  },
  slotButtonLabel: {
    ...g.labelMedium,
    color: g.white,
    opacity: 0.8,
  },
  slotButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: g.size(16),
    paddingBottom: g.size(96),
  },
});

export default function BookAppointment() {
  const params = useLocalSearchParams();
  const { bookingDate } = params;
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule>({} as Schedule);
  const [selectedSlot, setSelectedSlot] = useState<Slot>({} as Slot);
  const { data: scheduleData, isLoading: isLoadingSchedules, refetch } = useSchedule();
  const { data: slotData, isLoading: isLoadingSlots } = useSlot(bookingDate as string, selectedSchedule.id);
  const { mutate: onCreateAppointment } = useCreateAppointment();

  return (
    <>
      <StackListView
        title="Book Time"
        icon={<MaterialCommunityIcons name="calendar-heart" size={g.size(36)} color={g.white} />}
        isLoading={isLoadingSchedules}
        refetch={refetch}
      >
        <View style={s.sectionContainer}>
          <Text style={s.sectionHeader}>
            Select a Practitioner
          </Text>
          <View style={s.practitionerButtonsContainer}>
            {scheduleData?.map((schedule: Schedule) => {
              const selected = selectedSchedule.id === schedule.id;
              return (
                <TouchableOpacity
                  key={schedule.id}
                  style={[s.scheduleButton, selected && s.buttonSelected]}
                  onPress={() => {
                    setSelectedSlot({} as Slot);
                    setSelectedSchedule(schedule);
                  }}
                >
                  <BlurView
                    intensity={40}
                    tint="light"
                    style={StyleSheet.absoluteFill}
                  />
                  <FontAwesome5
                    name="user-md"
                    size={g.size(28)}
                    color={selected ? g.primaryBlue : g.white}
                    style={selected ? s.practitionerIconSelected : s.practitionerIcon}
                  />
                  <Text
                    style={[s.scheduleButtonLabel, selected && s.labelSelected]}
                    numberOfLines={1}
                  >
                    {schedule.comment.replace('Schedule for ', '')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        {!!selectedSchedule && isLoadingSlots ? <ActivityIndicator size="large" color={g.white} style={s.loading} /> : (
          <>
            {slotData?.length > 0 && (
              <View style={s.sectionContainer}>
                <Text style={s.sectionHeader}>
                  Slots available for
                  {' '}
                  {new Date(bookingDate as string).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
                <View style={s.slotButtonsContainer}>
                  {slotData.map((slot: Slot) => {
                    const selected = selectedSlot === slot;
                    return (
                      <TouchableOpacity
                        key={`${slot.start}-${slot.end}`}
                        style={[s.slotButton, selected && s.buttonSelected]}
                        onPress={() => setSelectedSlot(selected ? {} as Slot : slot)}
                      >
                        <BlurView
                          intensity={40}
                          tint="light"
                          style={StyleSheet.absoluteFill}
                        />
                        <Text style={[s.slotButtonLabel, selected && s.labelSelected]}>
                          {formatTime(slot.start, false)}
                          {' '}
                          -
                          {' '}
                          {formatTime(slot.end, true)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        )}
      </StackListView>
      {!!selectedSchedule && slotData?.length > 0 && (
        <Button
          label="Book Appointment"
          theme="secondary"
          style={s.bookButton}
          onPress={() => onCreateAppointment({
            startTime: selectedSlot?.start,
            endTime: selectedSlot?.end,
            practitionerID: selectedSchedule?.actor[0]?.reference,
          })}
          disabled={!Object.keys(selectedSlot).length}
        />
      )}
    </>
  );
}
