'use client';

export default function ProvidersMinimal() {
  console.log('ProvidersMinimal: Component rendering');
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Providers Page - Minimal Version</h1>
        <p className="text-gray-600">If you can see this, the basic routing works.</p>
        
        <div className="mt-8 p-4 bg-white rounded border">
          <h2 className="font-medium mb-2">Debug Info:</h2>
          <p>Component mounted successfully</p>
          <p>Time: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
}
