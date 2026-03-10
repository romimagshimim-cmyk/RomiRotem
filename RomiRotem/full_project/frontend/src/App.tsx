import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { OptionsSlider } from './app/widgets/OptionsSlider'; 
import { Space } from './app/widgets/SpaceProp'; 
import { TextInput } from './app/widgets/TextInput'; 

interface TeamInfo {
  name: string;
  city: string;
  country: string;
}

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

  const [prediction, setPrediction] = useState<{ winner: string; confidence: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [teamsData, setTeamsData] = useState<Record<string, TeamInfo>>({});

  useEffect(() => {      
      fetch('/teams.csv')
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load file! Status: ${response.status}`);
          }
          return response.text();
        })
        .then((csvText) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim().replace(/^[\uFEFF\u200B]/g, ""), 
            complete: (results) => {

              const map: Record<string, TeamInfo> = {};
              
              results.data.forEach((row: any, index) => {
                const teamNumber = row.TeamNum ? String(row.TeamNum).trim() : null; 
                
                if (teamNumber) {
                  map[teamNumber] = {
                    name: row.TeamName || 'Unknown Name',
                    city: row.TeamCity || 'Unknown City',
                    country: row.TeamCountry || 'Unknown Country'
                  };
                } else if (index < 5) {
                }
              });

              setTeamsData(map);
            },
          });
        })
        .catch((error) => console.error("Error", error));
    }, []);

  const handleSend = async () => {
    setPrediction(null);
    setErrorMsg(null);
    setIsLoading(true);

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
      setPrediction(result);

    } catch (error) {
      setErrorMsg("Failed to connect to server. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const closePopup = () => {
    setPrediction(null);
    setErrorMsg(null);
  };

  const isRedWinner = prediction?.winner?.toLowerCase().includes('red');
  const isBlueWinner = prediction?.winner?.toLowerCase().includes('blue');

  const renderTeamInfo = (teamNum: string, colorCode: string) => {
    const cleanNum = teamNum.trim();
    const data = teamsData[cleanNum];

    return (
      <div style={{ 
        width: '140px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        overflow: 'hidden' 
      }}>
        {data ? (
          <>
            <span style={{ 
              color: colorCode, 
              fontWeight: 'bold', 
              fontSize: '14px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {data.name}
            </span>
            <span style={{ 
              color: colorCode, 
              opacity: 0.7, 
              fontSize: '11px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginTop: '2px'
            }}>
              {data.city}, {data.country}
            </span>
          </>
        ) : (
          <span style={{ fontSize: '14px' }}>&nbsp;</span>
        )}
      </div>
    );
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
      
      {(prediction || errorMsg) && (
        <div 
          style={{
            position: 'fixed',
            top: '50px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '30px',
            padding: '18px 36px',
            borderRadius: '10px',
            background: prediction ? (isRedWinner ? '#3f1616' : isBlueWinner ? '#161e3f' : '#1e293b') : '#422006',
            border: `1px solid ${prediction ? (isRedWinner ? '#ef4444' : isBlueWinner ? '#3b82f6' : '#10b981') : '#fbbf24'}`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
            color: 'white',
            minWidth: '400px',
            maxWidth: '90%'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {prediction && (
              <>
                <span style={{ fontSize: '28px', fontWeight: 'bold' }}>Winner</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '18px', color: isRedWinner ? '#fca5a5' : isBlueWinner ? '#93c5fd' : 'white', letterSpacing: '0.5px' }}>
                    {prediction.winner}
                  </span>
                  <span style={{ fontSize: '15px', color: '#9ca3af' }}>
                    Confidence: <strong style={{ color: '#f3f4f6' }}>{(prediction.confidence * 100).toFixed(2)}%</strong>
                  </span>
                </div>
              </>
            )}

            {errorMsg && (
              <>
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#fde68a' }}>Error</span>
                <span style={{ fontSize: '18px', color: '#fde68a', fontWeight: '500' }}>
                  {errorMsg}
                </span>
              </>
            )}
          </div>
          
          <button 
            onClick={closePopup}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              fontSize: '24px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              transition: 'color 0.2s',
              flexShrink: 0
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'white'}
            onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
          > ✕</button>
        </div>
      )}

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

      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: '20px' }}>
        
        <div style={{ flex: 1, padding: '25px', border: '2px solid #ef4444', borderRadius: '12px', background: '#3f1616', boxSizing: 'border-box' }}>
          <h2 style={{ color: '#f87171', marginTop: 0, marginBottom: '20px', textAlign: 'center' }}>Red Alliance</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ flex: 1 }}><TextInput label="Red 1" placeholder="team number" type="number" value={red1} onChange={(e) => setRed1(e.target.value)} /></div>
              {renderTeamInfo(red1, '#fca5a5')}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ flex: 1 }}><TextInput label="Red 2" placeholder="team number" type="number" value={red2} onChange={(e) => setRed2(e.target.value)} /></div>
              {renderTeamInfo(red2, '#fca5a5')}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ flex: 1 }}><TextInput label="Red 3" placeholder="team number" type="number" value={red3} onChange={(e) => setRed3(e.target.value)} /></div>
              {renderTeamInfo(red3, '#fca5a5')}
            </div>

          </div>
          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: '#fca5a5' }}>
            Team Alliance: [ {red1 || '0'} , {red2 || '0'} , {red3 || '0'} ]
          </div>
        </div>

        <div style={{ flex: 1, padding: '25px', border: '2px solid #3b82f6', borderRadius: '12px', background: '#161e3f', boxSizing: 'border-box' }}>
          <h2 style={{ color: '#60a5fa', marginTop: 0, marginBottom: '20px', textAlign: 'center' }}>Blue Alliance</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ flex: 1 }}><TextInput label="Blue 1" placeholder="team number" type="number" value={blue1} onChange={(e) => setBlue1(e.target.value)} /></div>
              {renderTeamInfo(blue1, '#93c5fd')}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ flex: 1 }}><TextInput label="Blue 2" placeholder="team number" type="number" value={blue2} onChange={(e) => setBlue2(e.target.value)} /></div>
              {renderTeamInfo(blue2, '#93c5fd')}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ flex: 1 }}><TextInput label="Blue 3" placeholder="team number" type="number" value={blue3} onChange={(e) => setBlue3(e.target.value)} /></div>
              {renderTeamInfo(blue3, '#93c5fd')}
            </div>

          </div>
          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: '#93c5fd' }}>
            Team Alliance: [ {blue1 || '0'} , {blue2 || '0'} , {blue3 || '0'} ]
          </div>
        </div>

      </div>

      <div style={{ marginTop: '20px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button 
          onClick={handleSend}
          disabled={isLoading}
          style={{
            padding: '15px 40px',
            backgroundColor: isLoading ? '#059669' : '#10b981',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            transition: 'background-color 0.2s',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Calculating...' : 'Predict Winner'}
        </button>

        <div style={{ 
          marginTop: '30px', 
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

export default function App() {
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