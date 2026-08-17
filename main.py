import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from imblearn.over_sampling import SMOTE
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score,recall_score,precision_score,classification_report
import pickle



def load_dataset(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"{file_path} not found check again")
    
    df = pd.read_csv(file_path)
    
    df = df.drop_duplicates()
    
    return df

def label_encoding(df):
    
    encode = LabelEncoder()
    
    df['GENDER'] = encode.fit_transform(df['GENDER'])
    
    df['LUNG_CANCER'] = encode.fit_transform(df['LUNG_CANCER'])

    return df

def preprocessing(df):
    
    df['SMOKING'] = df['SMOKING'].map({1:0,2:1})

    df['YELLOW_FINGERS'] = df['YELLOW_FINGERS'].map({1:0,2:1})

    df['ANXIETY'] = df['ANXIETY'].map({1:0,2:1})
    
    df['PEER_PRESSURE'] = df['PEER_PRESSURE'].map({1:0,2:1})
    
    df['CHRONIC DISEASE'] = df['CHRONIC DISEASE'].map({1:0,2:1})
    
    df['FATIGUE '] = df['FATIGUE '].map({1:0,2:1})
    
    df['ALLERGY'] = df['ALLERGY '].map({1:0,2:1})
    df = df.drop(columns=['ALLERGY '])

    df['WHEEZING'] = df['WHEEZING'].map({1:0,2:1})
    
    df['ALCOHOL CONSUMING'] = df['ALCOHOL CONSUMING'].map({1:0,2:1})
    
    df['COUGHING'] = df['COUGHING'].map({1:0,2:1})
    
    df['SHORTNESS OF BREATH'] = df['SHORTNESS OF BREATH'].map({1:0,2:1})
    
    df['SWALLOWING DIFFICULTY'] = df['SWALLOWING DIFFICULTY'].map({1:0,2:1})
    
    df['CHEST PAIN'] = df['CHEST PAIN'].map({1:0,2:1})
    
    return df
    

def split_data(df):
    
    if df is None:
        raise Exception("No dataset found")
    
    x = df.drop(["LUNG_CANCER"],axis=1)
    y = df['LUNG_CANCER']
    
    x_train,x_test,y_train,y_test = train_test_split(x,y,test_size=0.25,stratify=y,random_state=42)
    
    
    smote = SMOTE()

    x_train_s,y_train_s = smote.fit_resample(x_train,y_train)
    
    return x_train_s,y_train_s,x_test,y_test

def build_base_model(x_train_s,y_train_s,x_test,y_test):
    model = XGBClassifier(n_estimators=200,learning_rate=0.8,subsample=0.8,max_depth=3,random_state=12)

    model.fit(x_train_s,y_train_s)

    pred = model.predict(x_test)

    acc = accuracy_score(y_test,pred)
    rec = recall_score(y_test,pred)
    pre = precision_score(y_test,pred)

    print(f"Accuracy Score: {acc}\n Recall Score: {rec} \n Precision Score: {pre}")
    print(classification_report(y_test,pred))
    

def hyperparameter_tuned_model(x_train_s,y_train_s,x_test,y_test):
    from sklearn.model_selection import RandomizedSearchCV, StratifiedKFold

    param_dist = {
        'n_estimators': [100, 200, 300, 400],
        'learning_rate': [0.01, 0.03, 0.05, 0.1],
        'max_depth': [2, 3, 4, 5],
        'min_child_weight': [1, 3, 5],
        'subsample': [0.6, 0.8, 1.0],
        'colsample_bytree': [0.6, 0.8, 1.0],
        'gamma': [0, 0.1, 0.5, 1, 2],
        'reg_alpha': [0, 0.1, 1],
        'reg_lambda': [1, 2, 5],
    }

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    search = RandomizedSearchCV(
        XGBClassifier(objective='binary:logistic', random_state=42),
        param_distributions=param_dist,
        n_iter=50,
        scoring='average_precision',
        cv=cv,
        random_state=42,
        n_jobs=-1,
    )
    search.fit(x_train_s, y_train_s)
    print("Best params found:", search.best_params_)
    best_model = search.best_estimator_

    pred = best_model.predict(x_test)

    acc = accuracy_score(y_test,pred)
    rec = recall_score(y_test,pred)
    pre = precision_score(y_test,pred)

    print(f"Accuracy Score: {acc}\n Recall Score: {rec} \n Precision Score: {pre}")
    print(classification_report(y_test,pred))
    return best_model

def save_model(model):
    
    if not model:
        raise Exception("Not found")
    
    with open('model.pkl','wb') as f:
        pickle.dump(model,f)

def risk_level(probability: float) -> str:
    if probability >= 0.60:
        return "High"
    if probability >= 0.30:
        return "Medium"
    return "Low"

def main():
    file_path = os.path.join(os.path.dirname(__file__), "survey lung cancer.csv")
    # load the csv file 
    df = load_dataset(file_path)
    # label encoding
    df_enc = label_encoding(df)
    # preprocessing
    df_pre = preprocessing(df_enc)
    # split dataset to train and test
    x_train_s,y_train_s,x_test,y_test = split_data(df_pre)
    # build model
    build_base_model(x_train_s,y_train_s,x_test,y_test)
    # hypertuned model parameters 
    model = hyperparameter_tuned_model(x_train_s,y_train_s,x_test,y_test)
    # save model
    save_model(model)

    
    
if __name__ == "__main__":
    main()