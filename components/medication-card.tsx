import { StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Medication } from '@interfaces';
import { BlurFill, ExplainButton } from '@components';
import { g } from '@styles';

const s = StyleSheet.create({
  card: {
    borderRadius: g.size(8),
    overflow: 'hidden',
    padding: g.size(16),
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: g.size(12),
  },
  date: {
    ...g.bodySmall,
    color: g.white,
  },
  dosage: {
    ...g.bodyMedium,
    color: g.white,
    flex: 1,
  },
  dosageAndDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: g.size(12),
  },
  medication: {
    ...g.bodyLarge,
    color: g.white,
    maxWidth: '95%',
  },
  medicationInfoContainer: {
    flex: 1,
    justifyContent: 'space-between',
    gap: g.size(8),
  },
});

export function MedicationCard({ med }: { med: Medication }) {
  const {
    medicationCodeableConcept: {
      coding: [{ display: medication }],
    },
    dosage,
    dateAsserted,
  } = med;

  return (
    <ExplainButton
      style={s.card}
      id={med.id}
      resourceType={med.resourceType}
      codes={med.medicationCodeableConcept.coding}
      description={med.medicationCodeableConcept.coding[0].display}
    >
      <BlurFill />
      <View style={s.cardContent}>
        <MaterialCommunityIcons name="pill" size={g.size(48)} color={g.white} />
        <View style={s.medicationInfoContainer}>
          <Text style={s.medication}>
            {medication.charAt(0).toUpperCase() + medication.slice(1)}
          </Text>
          <View style={s.dosageAndDateContainer}>
            <Text style={s.dosage}>
              {dosage[0].text.charAt(0).toUpperCase() + dosage[0].text.slice(1)}
            </Text>
            <Text style={s.date}>
              {new Date(dateAsserted).toLocaleDateString('en-US', {
                year: '2-digit',
                month: 'short',
                day: 'numeric'
              })}
            </Text>
          </View>
        </View>
      </View>
    </ExplainButton>
  );
}

export function MedicationSkeleton() {
  return (
    <View
      style={[s.card, { height: g.size(60) }]}
    >
      <BlurFill />
    </View>
  );
}
