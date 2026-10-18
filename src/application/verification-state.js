export function createVerificationState() {
  return {
    verificationRunId: null,
    verificationSearch: '',
    verificationOutcome: '',
    verificationComponent: '',
    verificationBatch: '',
    verificationLimit: 50,
    verificationArtifactSearch: '',
    verificationArtifactKind: '',
    verificationArtifactLimit: 100,
  };
}
