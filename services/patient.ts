import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { getToken } from './access-token';

async function patientCreate(data) {
  const token = await getToken();
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/Patient`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      resourceType: 'Patient',
      extension: [
        {
          url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex',
          valueCode: data.birthSex[0],
        },
      ],
      name: [
        {
          use: 'official',
          family: data.lastName,
          given: [data.firstName, ...(data.middleName ? [data.middleName] : [])]
        },
        ...(data.preferredName ? [{
          use: 'nickname',
          given: [data.preferredName]
        }] : [])
      ],
      telecom: [
        {
          system: 'phone',
          value: data.phone,
        },
        {
          system: 'email',
          value: data.email,
        }
      ],
      gender: data.gender.toLowerCase(),
      birthDate: data.birthDate,
    })
  });
  const urlParts = res.headers.get('Location').split('/');
  await SecureStore.setItemAsync('patient_id', urlParts[urlParts.length - 3]);
}

export function useCreatePatient() {
  return useMutation({
    mutationFn: (data) => patientCreate(data),
    onSuccess: () => router.push('records'),
    onError: () => {
      Alert.alert(
        'Error',
        'There was an error creating your account. Please try again.',
        [
          { text: 'OK' }
        ],
        { cancelable: false }
      );
    },
  });
}

async function getPatient() {
  const token = await getToken();
  const patientId = await SecureStore.getItemAsync('patient_id');
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/Patient/${patientId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      accept: 'application/json'
    }
  });
  const patient = await res.json();
  return patient;
}

export function usePatient() {
  const patientQuery = useQuery({
    queryKey: ['patient_data'],
    queryFn: () => getPatient(),
  });
  return patientQuery;
}