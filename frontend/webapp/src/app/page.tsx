"use client";

import { useState } from 'react';

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [developerInput, setDeveloperInput] = useState('You are a helpful assistant.'); // A sensible default
  const [apiKey, setApiKey] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse('');

    if (!apiKey) {
        setError('Please enter your OpenAI API key.');
        setLoading(false);
        return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            developer_message: developerInput,
            user_message: userInput,
            api_key: apiKey
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Backend returned an error');
      }
      
      const reader = res.body?.getReader();
      if (!reader) {
          throw new Error("Could not get response reader from the server.");
      }
      
      const decoder = new TextDecoder();
      let streamedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        streamedResponse += decoder.decode(value, { stream: true });
        setResponse(streamedResponse);
      }
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-blue-200 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">AI Chat Interface</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">OpenAI API Key</label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Enter your API key..."
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="developerMessage" className="block text-sm font-medium text-gray-700">Developer/System Message</label>
            <textarea
              id="developerMessage"
              value={developerInput}
              onChange={e => setDeveloperInput(e.target.value)}
              placeholder="e.g., You are a helpful assistant."
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              required
            />
          </div>

          <div>
            <label htmlFor="userMessage" className="block text-sm font-medium text-gray-700">User Message</label>
            <textarea
              id="userMessage"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              placeholder="Type your message to the AI..."
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Thinking...' : 'Send Message'}
          </button>
        </form>

        {error && <div className="mt-4 text-red-600 bg-red-100 border border-red-400 rounded-md p-3">{error}</div>}
        
        {response && (
          <div className="mt-6">
             <h2 className="text-xl font-semibold text-gray-700">AI Response:</h2>
             <div className="mt-2 bg-gray-50 rounded-md p-4 border text-gray-800 whitespace-pre-wrap">{response}</div>
          </div>
        )}
      </div>
       <footer className="mt-8 text-gray-600 text-sm">
        Powered by <span className="font-bold">Next.js</span> & <span className="font-bold">FastAPI</span>
      </footer>
    </main>
  );
}
