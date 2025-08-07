'use client';

  import { useState } from 'react';

  export default function BurnsTrainingApp() {
    const [message] = useState('Hello, Burns Training App!');

    return (
      <div className="container mx-auto py-8">
        <h1>{message}</h1>
      </div>
    );
  }
