const projectId = 'bikash-bhaiya-classes';
const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users`;

const demoUser = {
  fields: {
    name: { stringValue: 'Demo Student' },
    email: { stringValue: 'demo.student@example.com' },
    phone: { stringValue: '9876543210' },
    className: { stringValue: '12th' },
    schoolName: { stringValue: 'Kendriya Vidyalaya' },
    role: { stringValue: 'student' }
  }
};

async function addDemoUser() {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(demoUser)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Demo user added to Firestore:');
      console.log('Document Path:', data.name);
    } else {
      const err = await response.text();
      console.error('Failed to add user:', err);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

addDemoUser();
