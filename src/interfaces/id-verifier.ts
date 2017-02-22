export interface IDData {
  FaceImage: any;
}

export interface IDVerifier {
  extractDataFromNationalID(countryCode: string, front: Blob, back: Blob): Promise<IDData>;
  matchSelfie(idCardFinalImage: Blob, selfieSource: Blob): Promise<any>;
}
