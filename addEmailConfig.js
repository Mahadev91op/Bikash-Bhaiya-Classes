const projectId = 'bikash-bhaiya-classes';
const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/settings?documentId=emailConfig`;

const emailConfig = {
  fields: {
    email: { stringValue: 'devsamp1st@gmail.com' },
    appPassword: { stringValue: 'ygbq fheh rwwj vpqo' },
    adminEmail: { stringValue: 'devsamp1st@gmail.com' }
  }
};

async function addEmailConfig() {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailConfig)
    });
    
    if (response.ok) {
      console.log('Success! emailConfig added to Firestore settings.');
    } else {
      const err = await response.text();
      console.error('Failed to add config:', err);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

addEmailConfig();
