import { useState } from 'react';
import { OptionsSlider } from './app/widgets/OptionsSlider'; 
import { Space } from './app/widgets/SpaceProp'; 
import { TextInput } from './app/widgets/TextInput'; 

export const SettingsPanel = () => {
  const ModelMap = { 'Catboost': 'CB', 'Logistic Regresion': 'LR' };
  const CompLvlMap = { 'Qualifications': 1, 'SemiFinals': 2, 'Finals': 3 };

  const [model, setModel] = useState(ModelMap['Catboost']);
  const [level, setLevel] = useState(CompLvlMap['Qualifications']);

  const [red1, setRed1] = useState('');
  const [red2, setRed2] = useState('');
  const [red3, setRed3] = useState('');

  const [blue1, setBlue1] = useState('');
  const [blue2, setBlue2] = useState('');
  const [blue3, setBlue3] = useState('');

  const handleSend = async () => {
    const data = {
      red_dict: { [red1]: 1, [red2]: 2, [red3]: 3 },
      blue_dict: { [blue1]: 1, [blue2]: 2, [blue3]: 3 },
      comp_level: level,
      model_type: model,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Prediction result:", result);

      alert(`Predicted Winner: ${result.winner}\nConfidence: ${(result.confidence * 100).toFixed(2)}%`);
    } catch (error) {
      console.error("Error calling API:", error);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '30px',
      width: '100%',
      maxWidth: '1000px',
      background: '#2a2a2f',
      padding: '40px',
      borderRadius: '16px',
      boxShadow: '0px 10px 30px rgba(0,0,0,0.5)',
      color: 'white',
      boxSizing: 'border-box'
    }}>
      
      
      <div style={{ display: 'flex', gap: '40px', width: '100%', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <OptionsSlider options={ModelMap} value={model} onChange={setModel} />
          <div style={{ marginTop: '10px', color: '#888', fontSize: '14px' }}>
            Model: <span style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{model}</span>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <OptionsSlider options={CompLvlMap} value={level} onChange={setLevel} /> 
          <div style={{ marginTop: '10px', color: '#888', fontSize: '14px' }}>
            Level: <span style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{level}</span>
          </div>
        </div>
      </div>

      <Space h={"10px"}/>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        width: '100%', 
        gap: '20px' 
      }}>
        
        <div style={{ 
          flex: 1, 
          minWidth: 0,
          padding: '25px', 
          border: '2px solid #ef4444', 
          borderRadius: '12px', 
          background: '#3f1616',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ color: '#f87171', marginTop: 0, marginBottom: '20px', textAlign: 'center' }}>
            Red Alliance
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <TextInput label="Red 1" placeholder="team number" type="number" value={red1} onChange={(e) => setRed1(e.target.value)} />
            <TextInput label="Red 2" placeholder="team number" type="number" value={red2} onChange={(e) => setRed2(e.target.value)} />
            <TextInput label="Red 3" placeholder="team number" type="number" value={red3} onChange={(e) => setRed3(e.target.value)} />
          </div>

          <div style={{ 
            marginTop: '20px', 
            paddingTop: '15px', 
            borderTop: '1px solid rgba(255,255,255,0.1)', 
            textAlign: 'center', 
            color: '#fca5a5',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            Team Alliance: [ {red1 || '0'} , {red2 || '0'} , {red3 || '0'} ]
          </div>
        </div>

        <div style={{ 
          flex: 1, 
          minWidth: 0,
          padding: '25px', 
          border: '2px solid #3b82f6', 
          borderRadius: '12px', 
          background: '#161e3f',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ color: '#60a5fa', marginTop: 0, marginBottom: '20px', textAlign: 'center' }}>
            Blue Alliance
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <TextInput label="Blue 1" placeholder="team number" type="number" value={blue1} onChange={(e) => setBlue1(e.target.value)} />
            <TextInput label="Blue 2" placeholder="team number" type="number" value={blue2} onChange={(e) => setBlue2(e.target.value)} />
            <TextInput label="Blue 3" placeholder="team number" type="number" value={blue3} onChange={(e) => setBlue3(e.target.value)} />
          </div>

          <div style={{ 
            marginTop: '20px', 
            paddingTop: '15px', 
            borderTop: '1px solid rgba(255,255,255,0.1)', 
            textAlign: 'center', 
            color: '#93c5fd',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            Team Alliance: [ {blue1 || '0'} , {blue2 || '0'} , {blue3 || '0'} ]
          </div>
        </div>

      </div>

      <div style={{ marginTop: '20px', width: '100%', textAlign: 'center' }}>
        <button 
          onClick={() => handleSend()}
          style={{
            padding: '15px 40px',
            backgroundColor: '#10b981',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}
        >
          Predict Winner
        </button>
        <div style={{ 
          marginTop: '20px', 
          color: '#666', 
          fontSize: '12px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%'
        }}>
          Data: {JSON.stringify([[red1, red2, red3], [blue1, blue2, blue3], level, model])}
        </div>
      </div>

    </div>
  );
};

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw', 
      backgroundColor: '#1e1e21', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      margin: 0,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <SettingsPanel />
    </div>
  );
}

export default App;