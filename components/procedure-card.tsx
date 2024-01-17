import { StyleSheet, Text } from 'react-native';
import { capitalizeFirstCharacter, formatDate } from '@utils';
import { Procedure } from '@interfaces';
import { CardContainer } from '@components/card-container';
import { g } from '@styles';

const s = StyleSheet.create({
  procedureDate: {
    ...g.bodySmall,
    color: g.black,
    alignSelf: 'flex-end',
  },
  procedureType: {
    ...g.labelMedium,
    color: g.black,
  },
});

export function ProcedureCard({ procedure }: { procedure: Procedure, }) {
  const { code, performedDateTime } = procedure;
  const codeDisplay = code?.coding[0]?.display;

  return (
    <CardContainer>
      <Text
        style={s.procedureType}
        numberOfLines={3}
      >
        {capitalizeFirstCharacter(codeDisplay)}
      </Text>
      <Text style={s.procedureDate}>
        {formatDate(performedDateTime)}
      </Text>
    </CardContainer>
  );
}

export function ProcedureSkeleton() {
  return <CardContainer skeleton />;
}
