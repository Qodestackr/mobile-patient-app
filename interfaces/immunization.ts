interface Coding {
  system: string;
  code: string;
  display: string;
}

interface VaccineCode {
  coding: Coding[];
}

interface Patient {
  reference: string;
  type: string;
}

export interface Immunization {
  resourceType: string;
  id: string;
  status: string;
  vaccineCode: VaccineCode;
  patient: Patient;
  occurrenceDateTime: string;
  primarySource: boolean;
}
