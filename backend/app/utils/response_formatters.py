# utils/response_formatters.py
def df_to_list_of_dict(df):
    return df.reset_index().to_dict(orient="records")
