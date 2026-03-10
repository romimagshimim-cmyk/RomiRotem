from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib
from catboost import CatBoostClassifier
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


X = pd.read_csv('X.csv')

sdf = pd.read_csv('summery_df.csv')
sdf['endGame'] = sdf['endGame'].map({'Nothiing': 0, 'Parked': 1, 'ShallowCage': 2, 'DeepCage': 3})
sdf['endGame'] = sdf['endGame'].fillna(0)
sdf['team_number'] = sdf['team_number'].astype(str).str.extract(r'(\d+)').astype(int)
sdf.set_index(sdf.columns[0], inplace=True)
sdf = sdf.groupby(level=0).mean(numeric_only=True)
sdf.index.name = None
sdf = sdf.sort_index()

pipeline = joblib.load("LR_model.pkl")

cat_model = CatBoostClassifier()
cat_model.load_model("catboost_model.cbm")


class MatchRequest(BaseModel):
    red_dict: dict
    blue_dict: dict
    comp_level: int
    model_type: str = "CB"


def predict_match(red_dict, blue_dict, comp_level, model_type='CB'):

    row_data = {'comp_level': comp_level}
    
    for i, (team_str, pos) in enumerate(red_dict.items(), start=1):
        team = int(team_str)
        row_data[f'possition{i}_all1'] = pos
        
        if team in sdf.index:
            for col in sdf.columns:
                row_data[f'S_{col}_team{i}_all1'] = sdf.loc[team, col]
        else:
            for col in sdf.columns:
                row_data[f'S_{col}_team{i}_all1'] = 0
                
    for i, (team_str, pos) in enumerate(blue_dict.items(), start=1):
        team = int(team_str)
        row_data[f'possition{i}_all2'] = pos
        
        if team in sdf.index:
            for col in sdf.columns:
                row_data[f'S_{col}_team{i}_all2'] = sdf.loc[team, col]
        else:
            for col in sdf.columns:
                row_data[f'S_{col}_team{i}_all2'] = 0

    match_df = pd.DataFrame([row_data])
    
    for col in X.columns:
        if col not in match_df.columns:
            match_df[col] = 0 
            
    match_X = match_df[X.columns]
    
    if model_type == 'CB':
        pred = cat_model.predict(match_X)[0]
        prob = cat_model.predict_proba(match_X)[0]
    elif model_type == 'LR':
        pred = pipeline.predict(match_X)[0]
        prob = pipeline.predict_proba(match_X)[0]
    else:
        return {"error": "Invalid model_type. Use 'CB' or 'LR'."}
        
    winner = "Alliance 1 (Red)" if pred == 1 else "Alliance 2 (Blue)"
    win_prob = prob[1] if pred == 1 else prob[0]
    
    return {
        "winner": winner,
        "confidence": float(win_prob)
    }


@app.post("/predict")
def predict(match: MatchRequest):
    return predict_match(
        match.red_dict,
        match.blue_dict,
        match.comp_level,
        match.model_type
    )