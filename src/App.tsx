import React from 'react';
import Layout from './components/Layout';
import LabelerForm from './components/LabelerForm';

function App() {
  return (
    <Layout>
      <h1 className="text-3xl font-semibold mb-6 text-brand">Generador de Etiquetas</h1>
      <LabelerForm />
    </Layout>
  );
}

export default App;