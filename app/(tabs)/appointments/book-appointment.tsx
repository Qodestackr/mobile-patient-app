/* eslint-disable react/jsx-no-useless-fragment */
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import MaskedView from '@react-native-masked-view/masked-view';
import Modal from 'react-native-modal';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useCreateAppointment, useSchedule, useSlot } from '@services';
import { formatDate, formatTime, timeZoneOffset } from '@utils';
import { Schedule, Slot } from '@interfaces';
import { Button, Screen, BlurFill } from '@components';
import { g } from '@styles';

const s = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    marginTop: Platform.OS === 'android' ? g.size(48) : g.size(16),
    marginLeft: g.size(16),
  },
  backdrop: {
    flex: 1,
    backgroundColor: g.black,
    opacity: 0.5,
  },
  bookButton: {
    position: 'absolute',
    left: g.size(16),
    right: g.size(16),
  },
  buttonSelected: {
    backgroundColor: g.white,
  },
  error: {
    ...g.bodyMedium,
    color: g.white,
    textAlign: 'center',
    marginBottom: g.size(176),
  },
  labelSelected: {
    color: g.primaryBlue,
    opacity: 1,
  },
  loading: {
    flex: 1,
    paddingBottom: g.size(120),
  },
  maskedView: {
    flex: 1,
  },
  modal: {
    paddingHorizontal: g.size(8),
    paddingBottom: g.size(12),
    backgroundColor: g.white,
    borderRadius: g.size(16),
    gap: g.size(4),
  },
  modalContainer: {
    marginTop: -g.size(12),
  },
  modalToggleButton: {
    paddingVertical: g.size(8),
    paddingHorizontal: g.size(16),
    borderRadius: g.size(50),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalToggleButtonLabel: {
    ...g.bodyLarge,
    color: g.white,
  },
  modalToggleButtonPlaceholder: {
    color: g.neutral200
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
  scrollContent: {
    flexGrow: 1,
    gap: g.size(24),
    paddingHorizontal: g.size(16),
    paddingTop: Platform.OS === 'ios' ? g.size(28) : g.size(36),
  },
  sectionContainer: {
    gap: g.size(12),
  },
  sectionHeader: {
    ...g.labelMedium,
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
    paddingBottom: g.size(120),
  },
  title: {
    ...g.titleLarge,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: g.size(16),
    paddingLeft: g.size(20),
    marginTop: g.size(12),
  },
});

const reasonsForDoctorVisit = [
  { reasonLabel: 'Select One', appointmentDuration: 0 },
  { reasonLabel: 'Routine check-up', appointmentDuration: 80 },
  { reasonLabel: 'Symptoms evaluation', appointmentDuration: 40 },
  { reasonLabel: 'Follow-up appointment', appointmentDuration: 20 },
  { reasonLabel: 'Vaccination', appointmentDuration: 20 },
  { reasonLabel: 'Medication refill', appointmentDuration: 20 },
  { reasonLabel: 'Health concern', appointmentDuration: 20 },
  { reasonLabel: 'Specialist referral', appointmentDuration: 40 },
  { reasonLabel: 'Lab test', appointmentDuration: 40 },
  { reasonLabel: 'Physical examination', appointmentDuration: 80 },
  { reasonLabel: 'Preventive care', appointmentDuration: 40 },
  { reasonLabel: 'Other', appointmentDuration: 60 },
];

const appointmentTypes = [
  { appointmentTypeLabel: 'Select One', appointmentTypeCode: '0' },
  { appointmentTypeLabel: 'Office Visit', appointmentTypeCode: '308335008' },
  { appointmentTypeLabel: 'Video Call', appointmentTypeCode: '448337001' },
  { appointmentTypeLabel: 'Phone Call', appointmentTypeCode: '185317003' },
  { appointmentTypeLabel: 'Home Visit', appointmentTypeCode: '439708006' },
  // { appointmentTypeLabel: 'Lab Visit', appointmentTypeCode: '31108002' },
  // { appointmentTypeLabel: 'Inpatient', appointmentTypeCode: '53923005' },
];

export default function BookAppointment() {
  const tabBarHeight = useBottomTabBarHeight();
  const scrollViewRef = useRef<ScrollView>();
  const [showReasonPicker, setShowReasonPicker] = useState<boolean>(false);
  const [tentativeReason, setTentativeReason] = useState<string>('');
  const [appointmentReason, setAppointmentReason] = useState<string>('');
  const [appointmentDuration, setAppointmentDuration] = useState<number>(0);
  const [showAppointmentTypePicker, setShowAppointmentTypePicker] = useState<boolean>(false);
  const [appointmentType, setAppointmentType] = useState<string>('');
  const [appointmentTypeCode, setAppointmentTypeCode] = useState<string>('');
  const [tentativeAppointmentType, setTentativeAppointment] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [tentativeDate, setTentativeDate] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>(`${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule>({} as Schedule);
  const [selectedSlot, setSelectedSlot] = useState<Slot>({} as Slot);
  const { data: scheduleData, isLoading: isLoadingSchedules } = useSchedule();
  const { data: slotData, isLoading: isLoadingSlots } = useSlot(selectedDate as string, selectedSchedule.id, appointmentDuration);
  const { mutate: onCreateAppointment, isPending, isSuccess } = useCreateAppointment();
  const bookDisabled = !Object.keys(selectedSlot).length;
  const futureDateSelected = timeZoneOffset(selectedDate) > new Date();

  function closeDatePicker() {
    if (tentativeDate === 0) {
      setSelectedDate(new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    } else setSelectedDate(new Date(tentativeDate).toISOString().slice(0, 10));
    setShowDatePicker(false);
  }

  function onChangeDate(date: number) {
    if (timeZoneOffset(selectedDate).getDate() === new Date().getDate()) {
      setSelectedDate(new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    }
    setSelectedDate(new Date(date).toISOString().slice(0, 10));
  }

  useEffect(() => {
    if (!!Object.keys(selectedSchedule)?.length && slotData?.length === 0) {
      scrollViewRef?.current?.scrollToEnd();
    }
  }, [slotData]);

  function buttonLabel() {
    switch (true) {
      case !appointmentReason: return 'Select a reason';
      case !futureDateSelected: return 'Select a date';
      case !Object.keys(selectedSchedule).length: return 'Select a practitioner';
      case slotData?.length === 0: return 'Select a different date';
      case !Object.keys(selectedSlot).length: return 'Select a time';
      case isPending: return 'Booking...';
      case isSuccess: return 'Booked!';
      default: return 'Book Appointment';
    }
  }

  return (
    <Screen>
      <TouchableOpacity
        style={s.backButton}
        onPress={() => router.back()}
      >
        <Feather name="arrow-left" size={g.size(48)} color={g.white} />
      </TouchableOpacity>
      <View style={s.titleContainer}>
        <MaterialCommunityIcons name="calendar-plus" size={g.size(36)} color={g.white} />
        <Text style={s.title}>
          Book Appointment
        </Text>
      </View>
      <MaskedView
        style={s.maskedView}
        maskElement={(
          <LinearGradient
            style={s.maskedView}
            colors={[g.transparent, g.white]}
            locations={[0, 0.06]}
          />
        )}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          scrollEnabled={futureDateSelected}
          ref={scrollViewRef}
        >
          <View style={s.sectionContainer}>
            <Text style={s.sectionHeader}>
              Reason for Visit
            </Text>
            <>
              <TouchableOpacity
                style={s.modalToggleButton}
                onPress={() => setShowReasonPicker(true)}
              >
                <BlurFill />
                <Text
                  style={[
                    s.modalToggleButtonLabel,
                    !appointmentReason && s.modalToggleButtonPlaceholder,
                  ]}
                >
                  {appointmentReason || 'Select'}
                </Text>
                <Feather name="chevron-down" size={g.size(20)} color={g.white} />
              </TouchableOpacity>
              <View style={s.modalContainer}>
                <Modal
                  animationIn="fadeIn"
                  animationOut="fadeOut"
                  isVisible={showReasonPicker}
                  swipeDirection="right"
                  onSwipeComplete={() => setShowReasonPicker(false)}
                  customBackdrop={(
                    <TouchableWithoutFeedback onPress={() => setShowReasonPicker(false)}>
                      <View style={s.backdrop} />
                    </TouchableWithoutFeedback>
                  )}
                >
                  <View style={s.modal}>
                    <Picker
                      selectedValue={tentativeReason}
                      onValueChange={(itemValue) => setTentativeReason(itemValue)}
                    >
                      {reasonsForDoctorVisit.map((item: { reasonLabel: string }) => (
                        <Picker.Item
                          key={item.reasonLabel}
                          label={item.reasonLabel}
                          value={item.reasonLabel}
                        />
                      ))}
                    </Picker>
                    <Button
                      label="Select Reason"
                      theme="primary"
                      onPress={() => {
                        setShowReasonPicker(false);
                        if (reasonsForDoctorVisit.find((item) => item.reasonLabel === tentativeReason)?.appointmentDuration) {
                          setAppointmentReason(tentativeReason);
                          setAppointmentDuration(reasonsForDoctorVisit.find((item) => item.reasonLabel === tentativeReason)?.appointmentDuration);
                        }
                      }}
                    />
                  </View>
                </Modal>
              </View>
            </>
          </View>
          {!!appointmentReason && (
            <View style={s.sectionContainer}>
              <Text style={s.sectionHeader}>
                Appointment Type
              </Text>
              <>
                <TouchableOpacity
                  style={s.modalToggleButton}
                  onPress={() => setShowAppointmentTypePicker(true)}
                >
                  <BlurFill />
                  <Text
                    style={[
                      s.modalToggleButtonLabel,
                      !appointmentType && s.modalToggleButtonPlaceholder,
                    ]}
                  >
                    {appointmentType || 'Select'}
                  </Text>
                  <Feather name="chevron-down" size={g.size(20)} color={g.white} />
                </TouchableOpacity>
                <View style={s.modalContainer}>
                  <Modal
                    animationIn="fadeIn"
                    animationOut="fadeOut"
                    isVisible={showAppointmentTypePicker}
                    swipeDirection="right"
                    onSwipeComplete={() => setShowAppointmentTypePicker(false)}
                    customBackdrop={(
                      <TouchableWithoutFeedback onPress={() => setShowAppointmentTypePicker(false)}>
                        <View style={s.backdrop} />
                      </TouchableWithoutFeedback>
                    )}
                  >
                    <View style={s.modal}>
                      <Picker
                        selectedValue={tentativeAppointmentType}
                        onValueChange={(itemValue) => setTentativeAppointment(itemValue)}
                      >
                        {appointmentTypes.map((item: { appointmentTypeLabel: string }) => (
                          <Picker.Item
                            key={item.appointmentTypeLabel}
                            label={item.appointmentTypeLabel}
                            value={item.appointmentTypeLabel}
                          />
                        ))}
                      </Picker>
                      <Button
                        label="Select Appointment Type"
                        theme="primary"
                        onPress={() => {
                          setShowAppointmentTypePicker(false);
                          if (appointmentTypes.find((item) => item.appointmentTypeLabel === tentativeAppointmentType)?.appointmentTypeCode) {
                            setAppointmentType(tentativeAppointmentType);
                            setAppointmentTypeCode(appointmentTypes.find((item) => (
                              item.appointmentTypeLabel === tentativeAppointmentType
                            ))?.appointmentTypeCode);
                          }
                        }}
                      />
                    </View>
                  </Modal>
                </View>
              </>
            </View>
          )}
          {!!appointmentType && (
            <View style={s.sectionContainer}>
              <Text style={s.sectionHeader}>
                Date
              </Text>
              {Platform.OS === 'android' && showDatePicker && (
                <DateTimePicker
                  mode="date"
                  value={timeZoneOffset(selectedDate)}
                  minimumDate={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
                  themeVariant="dark"
                  maximumDate={null}
                  onChange={(e: DateTimePickerEvent) => {
                    setShowDatePicker(false);
                    onChangeDate(e.nativeEvent.timestamp);
                  }}
                />
              )}
              {Platform.OS === 'ios' && (
                <Modal
                  animationIn="fadeIn"
                  animationOut="fadeOut"
                  isVisible={showDatePicker}
                  swipeDirection="right"
                  onSwipeComplete={() => closeDatePicker()}
                  customBackdrop={(
                    <TouchableWithoutFeedback onPress={() => closeDatePicker()}>
                      <View style={s.backdrop} />
                    </TouchableWithoutFeedback>
                  )}
                >
                  <View style={s.modal}>
                    <DateTimePicker
                      mode="date"
                      display="inline"
                      value={timeZoneOffset(selectedDate)}
                      minimumDate={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
                      themeVariant="light"
                      maximumDate={null}
                      onChange={(e: DateTimePickerEvent) => setTentativeDate(e.nativeEvent.timestamp)}
                    />
                    <Button
                      label="Select Date"
                      theme="primary"
                      onPress={() => closeDatePicker()}
                    />
                  </View>
                </Modal>
              )}
              <TouchableOpacity
                style={s.modalToggleButton}
                onPress={() => setShowDatePicker(true)}
              >
                <BlurFill />
                <Text
                  style={[
                    s.modalToggleButtonLabel,
                    !futureDateSelected && s.modalToggleButtonPlaceholder,
                  ]}
                >
                  {futureDateSelected ? formatDate(selectedDate, 'numeric') : 'Select a date'}
                </Text>
                <MaterialCommunityIcons name="calendar-blank" size={g.size(20)} color={g.white} />
              </TouchableOpacity>
            </View>
          )}
          {futureDateSelected && (
            <>
              {isLoadingSchedules
                ? <ActivityIndicator size="large" color={g.white} style={s.loading} />
                : (
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
                            <BlurFill />
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
                )}
            </>
          )}
          {!!Object.keys(selectedSchedule).length && isLoadingSlots
            ? <ActivityIndicator size="large" color={g.white} style={s.loading} />
            : (
              <>
                {slotData?.length > 0 && (
                  <View style={s.sectionContainer}>
                    <Text style={s.sectionHeader}>
                      Appointments available for
                      {' '}
                      {formatDate(selectedDate, 'numeric')}
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
                            <BlurFill />
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
                {!!Object.keys(selectedSchedule).length && slotData.length === 0 && (
                  <Text style={s.error}>There are no available appointments for the selected date. Please choose a different day.</Text>)}
              </>
            )}
        </ScrollView>
        <Button
          label={buttonLabel()}
          theme="secondary"
          style={[
            s.bookButton,
            { bottom: Platform.OS === 'ios' ? g.size(32) : tabBarHeight + g.size(12) }
          ]}
          onPress={() => onCreateAppointment({
            startTime: selectedSlot?.start,
            endTime: selectedSlot?.end,
            practitionerID: selectedSchedule?.actor[0]?.reference,
            reason: appointmentReason,
            appointmentType,
            appointmentTypeCode,
          })}
          disabled={bookDisabled}
        />
      </MaskedView>
    </Screen>
  );
}
