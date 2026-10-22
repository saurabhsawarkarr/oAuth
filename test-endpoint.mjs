async function testEndpoint() {
  console.log('Testing POST http://localhost:3000/api/research ...');
  const res = await fetch('http://localhost:3000/api/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Spotify' }),
  });

  console.log('Response Status:', res.status);
  console.log('Content-Type:', res.headers.get('content-type'));

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP error ${res.status}: ${errorText.slice(0, 300)}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let receivedEvents = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const text = decoder.decode(value);
    const lines = text.split('\n\n').filter(Boolean);
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const event = JSON.parse(line.substring(6));
        console.log(`[SSE Event] Stage ${event.stageIndex}/7: ${event.message}`);
        receivedEvents++;
        if (event.stage === 'completed') {
          console.log('Guide Received Successfully! Title:', event.guide?.provider?.name);
        }
      }
    }
  }

  console.log(`\nTest Passed! Received ${receivedEvents} SSE events in real-time.`);
}

testEndpoint().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
